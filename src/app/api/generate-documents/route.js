import { NextResponse } from 'next/server';
import AIClientFactory from '../../../lib/ai/index';

/**
 * Transform the AI response back to the legacy format expected by the frontend
 * @param {Object} aiResponse - The AI response (either new schema or GPT format)
 * @param {Array} selectedSkills - The skills selected by the user
 * @returns {Object} - Transformed content in legacy format
 */
function transformToLegacyFormat(aiResponse, selectedSkills) {
  // Check if this is the new standardized schema (from Gemini)
  if (aiResponse.name && (aiResponse.experience || aiResponse.work_experience)) {
    return transformNewSchemaToLegacy(aiResponse, selectedSkills);
  }
  
  // Check if this is the GPT format
  if (aiResponse.bullets && aiResponse.coverLetter) {
    return transformGPTFormatToLegacy(aiResponse, selectedSkills);
  }
  
  // Fallback: assume it's already in legacy format
  return aiResponse;
}

/**
 * Transform the new standardized schema to legacy format
 */
function transformNewSchemaToLegacy(newSchema, selectedSkills) {
  // Extract suggested skills from the new schema
  const suggestedSkills = [];
  
  // Add selected skills as suggested skills
  suggestedSkills.push(...selectedSkills);
  
  // Add skills from the new schema
  if (newSchema.technical_skills) {
    Object.values(newSchema.technical_skills).forEach(skillArray => {
      if (Array.isArray(skillArray)) {
        suggestedSkills.push(...skillArray);
      }
    });
  }
  
  // Remove duplicates
  const uniqueSuggestedSkills = [...new Set(suggestedSkills)];

  // Transform work experience and projects into newBullets format
  const newBullets = [];
  
  // Add work experience bullets (handle both old and new formats)
  const experienceData = newSchema.experience || newSchema.work_experience;
  if (experienceData && Array.isArray(experienceData)) {
    const workExperienceBullets = experienceData.flatMap(job => {
      const achievements = job.achievements || job.responsibilities || [];
      return achievements.map(achievement => ({
        text: achievement,
        category: 'Professional Experience'
      }));
    });
    
    if (workExperienceBullets.length > 0) {
      newBullets.push({
        category: 'Professional Experience',
        bullets: workExperienceBullets.map(bullet => bullet.text)
      });
    }
  }
  
  // Add project bullets
  if (newSchema.projects && Array.isArray(newSchema.projects)) {
    const projectBullets = newSchema.projects.flatMap(project => 
      project.achievements ? project.achievements.map(achievement => ({
        text: achievement,
        category: 'Projects'
      })) : []
    );
    
    if (projectBullets.length > 0) {
      newBullets.push({
        category: 'Projects',
        bullets: projectBullets.map(bullet => bullet.text)
      });
    }
  }
  
  // Generate a cover letter from the summary and work experience
  let coverLetter = '';
  if (newSchema.summary) {
    coverLetter += newSchema.summary + '\n\n';
  }
  
  if (experienceData && experienceData.length > 0) {
    const latestJob = experienceData[0];
    const jobTitle = latestJob.job_title || latestJob.title || 'professional';
    const company = latestJob.company || 'various organizations';
    coverLetter += `With my experience as a ${jobTitle} at ${company}, I am excited about the opportunity to contribute to your team. `;
  }
  
  coverLetter += 'I am confident that my skills and experience make me a strong candidate for this position.';

  return {
    suggestedSkills: uniqueSuggestedSkills,
    newBullets: newBullets,
    coverLetter: coverLetter
  };
}

/**
 * Transform the GPT format to legacy format
 */
function transformGPTFormatToLegacy(gptResponse, selectedSkills) {
  // Extract suggested skills
  const suggestedSkills = [...selectedSkills];
  
  // Add skills from GPT bullets
  if (gptResponse.bullets && Array.isArray(gptResponse.bullets)) {
    gptResponse.bullets.forEach(bulletGroup => {
      if (bulletGroup.skill) {
        suggestedSkills.push(bulletGroup.skill);
      }
    });
  }
  
  // Remove duplicates
  const uniqueSuggestedSkills = [...new Set(suggestedSkills)];

  // Transform GPT bullets to newBullets format
  const newBullets = [];
  
  if (gptResponse.bullets && Array.isArray(gptResponse.bullets)) {
    gptResponse.bullets.forEach(bulletGroup => {
      if (bulletGroup.bullets && Array.isArray(bulletGroup.bullets)) {
        newBullets.push({
          category: bulletGroup.skill || 'Professional Experience',
          bullets: bulletGroup.bullets
        });
      }
    });
  }

  return {
    suggestedSkills: uniqueSuggestedSkills,
    newBullets: newBullets,
    coverLetter: gptResponse.coverLetter || ''
  };
}

/**
 * POST /api/generate-documents
 * Generates resume bullets and cover letter using AI
 */
export async function POST(request) {
  try {
    console.log('API: Starting document generation request...');
    
    // Parse request body
    const body = await request.json();
    const { jobDescription, resumeText, selectedSkills } = body;

    // Validate inputs
    if (!jobDescription || !resumeText || !selectedSkills) {
      console.error('API: Missing required fields in request');
      return NextResponse.json(
        { error: 'Missing required fields: jobDescription, resumeText, selectedSkills' },
        { status: 400 }
      );
    }

    if (!Array.isArray(selectedSkills) || selectedSkills.length === 0) {
      console.error('API: selectedSkills must be a non-empty array');
      return NextResponse.json(
        { error: 'selectedSkills must be a non-empty array' },
        { status: 400 }
      );
    }

    console.log('API: Input validation passed');

    // Initialize AI client factory
    console.log('API: Initializing AI client factory...');
    const aiFactory = new AIClientFactory();
    console.log('API: AI client factory initialized successfully');
    
    // Get available providers
    const availableProviders = aiFactory.getAvailableProviders();
    console.log('API: Available providers:', availableProviders);
    
    if (availableProviders.length === 0) {
      throw new Error('No AI providers are available. Please check your API keys.');
    }
    
    // Choose AI provider - prefer GPT if available, otherwise use Gemini
    let aiProvider = availableProviders.includes('gpt') ? 'gpt' : 'gemini';
    
    console.log(`API: Using ${aiProvider.toUpperCase()} AI provider`);

    // Generate content using AI
    const generatedContent = await aiFactory.generateResumeContent(
      aiProvider,
      {
        jobDescription,
        resumeText,
        selectedSkills
      }
    );

    console.log('API: AI generation completed successfully');

    // Transform the new standardized schema back to the expected format
    const transformedContent = transformToLegacyFormat(generatedContent, selectedSkills);

    // Return the transformed content
    return NextResponse.json({
      success: true,
      data: transformedContent
    });

  } catch (error) {
    console.error('API: Error in document generation:', error);
    
    // Return appropriate error response
    return NextResponse.json(
      { 
        error: 'Failed to generate documents',
        details: error.message 
      },
      { status: 500 }
    );
  }
}


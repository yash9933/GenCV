import { NextResponse } from 'next/server';
import AIClientFactory from '../../../lib/ai/index';

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
 * Generates AI bullets and cover letter based on job description and selected skills
 */
export async function POST(request) {
  try {
    console.log('API: Starting AI bullet generation request...');
    
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
    console.log('API: Selected skills:', selectedSkills);

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
    
    console.log(`API: Using ${aiProvider.toUpperCase()} AI provider for bullet generation`);

    // Generate enhanced content (bullets and cover letter)
    console.log('API: Generating AI bullets and cover letter...');
    console.log('API: Calling generateBulletPoints with provider:', aiProvider);
    console.log('API: Parameters:', { jobDescription: jobDescription?.length, resumeText: resumeText?.length, selectedSkills });
    
    let generatedContent;
    try {
      generatedContent = await aiFactory.generateBulletPoints(
        aiProvider,
        {
          jobDescription,
          resumeText,
          selectedSkills
        }
      );
      console.log('API: generateBulletPoints completed successfully');
    } catch (bulletError) {
      console.error('API: Error in generateBulletPoints:', bulletError);
      throw new Error(`Bullet generation failed: ${bulletError.message}`);
    }

    console.log('API: Content generation completed successfully');
    console.log('API: Generated content structure:', Object.keys(generatedContent));

    // Transform the generated content to the expected format
    const transformedContent = transformGPTFormatToLegacy(generatedContent, selectedSkills);
    console.log('API: Transformed content structure:', Object.keys(transformedContent));

    // Return generated content
    return NextResponse.json({
      success: true,
      data: transformedContent
    });

  } catch (error) {
    console.error('API: Error in bullet generation:', error);
    
    // Return appropriate error response
    return NextResponse.json(
      { 
        error: 'Failed to generate AI bullets and cover letter',
        details: error.message 
      },
      { status: 500 }
    );
  }
}


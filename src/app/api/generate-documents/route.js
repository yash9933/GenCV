import { NextResponse } from 'next/server';
import AIClientFactory from '../../../lib/ai/index';

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
    
    // Choose AI provider (can be easily switched)
    const aiProvider = 'gemini'; // Change to 'gpt' to use OpenAI
    
    console.log(`API: Using AI provider: ${aiProvider}`);

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

    // Return the generated content
    return NextResponse.json({
      success: true,
      data: generatedContent
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


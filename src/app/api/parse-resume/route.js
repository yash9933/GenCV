import { NextResponse } from 'next/server';
import AIClientFactory from '../../../lib/ai/index';

/**
 * POST /api/parse-resume
 * Parses resume text into standardized JSON schema using AI
 */
export async function POST(request) {
  try {
    console.log('API: Starting resume parsing request...');
    
    // Parse request body
    const body = await request.json();
    const { resumeText, jobDescription } = body;

    // Validate inputs
    if (!resumeText) {
      console.error('API: Missing resumeText in request');
      return NextResponse.json(
        { error: 'Missing required field: resumeText' },
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
    
    // Choose AI provider - prefer Gemini for parsing, otherwise use GPT
    let aiProvider = availableProviders.includes('gemini') ? 'gemini' : 'gpt';
    
    console.log(`API: Using ${aiProvider.toUpperCase()} AI provider for resume parsing`);

    // Parse resume using AI
    const parsedResume = await aiFactory.generateResumeContent(
      aiProvider,
      {
        jobDescription: jobDescription || '',
        resumeText,
        selectedSkills: [] // Empty for initial parsing
      }
    );

    console.log('API: Resume parsing completed successfully');

    // Return the parsed resume
    return NextResponse.json({
      success: true,
      data: parsedResume
    });

  } catch (error) {
    console.error('API: Error in resume parsing:', error);
    
    // Return appropriate error response
    return NextResponse.json(
      { 
        error: 'Failed to parse resume',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

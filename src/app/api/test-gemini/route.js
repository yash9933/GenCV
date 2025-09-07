import { NextResponse } from 'next/server';
import AIClientFactory from '../../../lib/ai/index';

/**
 * GET /api/test-gemini
 * Test endpoint to check if Gemini API is working
 */
export async function GET() {
  try {
    console.log('Testing Gemini API...');
    
    // Check environment variables
    const geminiApiKey = process.env.GEMINI_API_KEY;
    console.log('Gemini API key available:', geminiApiKey ? 'Yes' : 'No');
    
    if (!geminiApiKey) {
      return NextResponse.json({
        success: false,
        error: 'GEMINI_API_KEY environment variable is not set'
      });
    }
    
    // Initialize AI client factory
    const aiFactory = new AIClientFactory();
    const availableProviders = aiFactory.getAvailableProviders();
    console.log('Available providers:', availableProviders);
    
    if (!availableProviders.includes('gemini')) {
      return NextResponse.json({
        success: false,
        error: 'Gemini client not available'
      });
    }
    
    // Test with a simple prompt
    const testPrompt = 'Return a simple JSON object with a "test" field set to "success".';
    
    try {
      const response = await aiFactory.generateResumeContent('gemini', {
        jobDescription: '',
        resumeText: 'Test resume text',
        selectedSkills: []
      });
      
      return NextResponse.json({
        success: true,
        message: 'Gemini API is working',
        response: response
      });
    } catch (aiError) {
      console.error('AI Error:', aiError);
      return NextResponse.json({
        success: false,
        error: `AI Error: ${aiError.message}`
      });
    }
    
  } catch (error) {
    console.error('Test error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    });
  }
}

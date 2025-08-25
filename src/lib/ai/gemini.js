import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Gemini AI Client
 */
class GeminiClient {
  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not set');
    }
    console.log('Gemini API Key found:', apiKey ? 'Yes' : 'No');
    this.genAI = new GoogleGenerativeAI(apiKey);
    // Use the correct model name - gemini-1.5-flash is more reliable
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }

  /**
   * Generate content using Gemini
   * @param {string} prompt - The prompt to send to Gemini
   * @returns {Promise<string>} - Generated content
   */
  async generateContent(prompt) {
    try {
      console.log('Sending request to Gemini API...');
      console.log('Using model:', this.model.modelName);
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      console.log('Gemini API response received successfully');
      return text;
    } catch (error) {
      console.error('Gemini API Error:', error);
      
      // If model not found, try alternative models
      if (error.message.includes('not found') || error.message.includes('404')) {
        console.log('Model not found, trying alternative models...');
        throw new Error(`Gemini API Error: Model not found. Please check your API key and try using 'gemini-1.5-flash' or 'gemini-1.5-pro' model.`);
      }
      
      throw new Error(`Gemini API Error: ${error.message}`);
    }
  }

  /**
   * Generate resume and cover letter content
   * @param {Object} params - Parameters for generation
   * @param {string} params.jobDescription - Job description
   * @param {string} params.resumeText - Original resume text
   * @param {string[]} params.selectedSkills - Selected skills
   * @returns {Promise<Object>} - Generated content
   */
  async generateResumeContent({ jobDescription, resumeText, selectedSkills }) {
    const prompt = this.buildPrompt({ jobDescription, resumeText, selectedSkills });
    
    try {
      const response = await this.generateContent(prompt);
      
             // Parse the JSON response
       let parsedResponse;
       try {
         console.log('Raw Gemini response:', response);
         console.log('Response length:', response.length);
         console.log('First 200 characters:', response.substring(0, 200));
         
         parsedResponse = JSON.parse(response);
       } catch (parseError) {
         console.error('Failed to parse Gemini response as JSON:', parseError);
         console.log('Raw response:', response);
         console.log('Response type:', typeof response);
         
         // Try to clean the response and parse again
         try {
           const cleanedResponse = response.trim();
           // Remove any markdown formatting
           const jsonStart = cleanedResponse.indexOf('{');
           const jsonEnd = cleanedResponse.lastIndexOf('}') + 1;
           if (jsonStart !== -1 && jsonEnd !== -1) {
             const jsonOnly = cleanedResponse.substring(jsonStart, jsonEnd);
             console.log('Attempting to parse cleaned JSON:', jsonOnly);
             parsedResponse = JSON.parse(jsonOnly);
           } else {
             throw new Error('No JSON object found in response');
           }
         } catch (cleanError) {
           console.error('Failed to clean and parse response:', cleanError);
           throw new Error('Invalid JSON response from Gemini API. Please try again.');
         }
       }

             // Validate response structure
       if (!parsedResponse.suggestedSkills || !parsedResponse.newBullets || !parsedResponse.coverLetter) {
         throw new Error('Incomplete response from Gemini API - missing required fields');
       }

      return parsedResponse;
    } catch (error) {
      console.error('Error in generateResumeContent:', error);
      throw error;
    }
  }

  /**
   * Build the prompt for Gemini
   * @param {Object} params - Parameters for prompt building
   * @returns {string} - Formatted prompt
   */
  buildPrompt({ jobDescription, resumeText, selectedSkills }) {
    return `You are a highly skilled career coach and professional resume writer. Your task is to analyze a job description and generate new resume bullets and cover letter, then return ONLY a valid JSON object with no additional text or formatting.

JOB DESCRIPTION:
${jobDescription}

SELECTED SKILLS TO HIGHLIGHT:
${selectedSkills.join(', ')}

CRITICAL: You must return ONLY valid JSON. No markdown, no explanations, no additional text.

REQUIRED JSON STRUCTURE:
{
  "suggestedSkills": ["skill1", "skill2", "skill3", "skill4", "skill5"],
  "newBullets": [
    {
      "category": "Professional Experience",
      "bullets": [
        "New bullet point that highlights selected skills and matches job requirements",
        "Another new bullet point showcasing relevant experience",
        "Third bullet point demonstrating key competencies"
      ]
    },
    {
      "category": "Projects",
      "bullets": [
        "Project-related bullet point highlighting selected skills",
        "Another project bullet showcasing relevant achievements"
      ]
    }
  ],
  "coverLetter": "Complete 3-4 paragraph cover letter personalized to the company and role, integrating key accomplishments and adopting a professional but confident tone."
}

RULES:
1. Return ONLY the JSON object above - no other text
2. Extract 5-7 key skills from the job description for suggestedSkills
3. Generate 8-12 completely NEW bullet points based on the job description and selected skills
4. Organize bullets into categories like "Professional Experience", "Projects", "Technical Skills", etc.
5. Each bullet should be specific, quantifiable, and highlight the selected skills
6. Write a compelling 3-4 paragraph cover letter
7. Ensure all content is ATS-friendly and professional
8. Use proper JSON formatting with double quotes around all strings
9. Do NOT reference or rewrite existing resume content - create entirely new bullets

JSON RESPONSE:`;
  }
}

export default GeminiClient;


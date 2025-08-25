import OpenAI from 'openai';

/**
 * GPT AI Client
 */
class GPTClient {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  /**
   * Generate content using GPT
   * @param {string} prompt - The prompt to send to GPT
   * @returns {Promise<string>} - Generated content
   */
  async generateContent(prompt) {
    try {
      console.log('Sending request to GPT API...');
      
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a highly skilled career coach and professional resume writer. Always respond with valid JSON only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      });
      
      const response = completion.choices[0].message.content;
      console.log('GPT API response received successfully');
      return response;
    } catch (error) {
      console.error('GPT API Error:', error);
      throw new Error(`GPT API Error: ${error.message}`);
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
        parsedResponse = JSON.parse(response);
      } catch (parseError) {
        console.error('Failed to parse GPT response as JSON:', parseError);
        console.log('Raw response:', response);
        throw new Error('Invalid JSON response from GPT API');
      }

      // Validate response structure
      if (!parsedResponse.suggestedSkills || !parsedResponse.rewrittenBullets || !parsedResponse.coverLetter) {
        throw new Error('Incomplete response from GPT API - missing required fields');
      }

      return parsedResponse;
    } catch (error) {
      console.error('Error in generateResumeContent:', error);
      throw error;
    }
  }

  /**
   * Build the prompt for GPT
   * @param {Object} params - Parameters for prompt building
   * @returns {string} - Formatted prompt
   */
  buildPrompt({ jobDescription, resumeText, selectedSkills }) {
    return `You are a highly skilled career coach and professional resume writer with expertise in creating ATS-friendly, human-like resumes and cover letters.

TASK: Analyze the provided job description and resume, then generate personalized content that highlights the selected skills.

JOB DESCRIPTION:
${jobDescription}

ORIGINAL RESUME:
${resumeText}

SELECTED SKILLS TO HIGHLIGHT:
${selectedSkills.join(', ')}

INSTRUCTIONS:
1. Analyze the job description to identify core responsibilities, required skills, and company tone
2. Analyze the resume to identify key accomplishments and quantifiable metrics
3. Generate content that specifically highlights the selected skills

REQUIRED OUTPUT FORMAT (return ONLY valid JSON):
{
  "suggestedSkills": ["skill1", "skill2", "skill3", "skill4", "skill5"],
  "rewrittenBullets": [
    {
      "original": "Original bullet point text",
      "variants": [
        "Variant A that highlights selected skills",
        "Variant B with different emphasis on selected skills"
      ]
    }
  ],
  "coverLetter": "Complete 3-4 paragraph cover letter personalized to the company and role, integrating key accomplishments and adopting a professional but confident tone. Do not include placeholders or generic phrases."
}

IMPORTANT RULES:
- Return ONLY valid JSON - no additional text
- suggestedSkills: Extract 5-7 key skills from the job description
- rewrittenBullets: For each bullet in the resume, create 2-3 unique variants that reframe accomplishments to highlight selected skills
- coverLetter: Write a complete, compelling cover letter (3-4 paragraphs) that feels personal and targeted
- Ensure all content is ATS-friendly and professional
- Do not include generic phrases like "I am a highly motivated individual"
- Make sure the JSON is properly formatted and valid

RESPONSE:`;
  }
}

export default GPTClient;


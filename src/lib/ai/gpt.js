import OpenAI from 'openai';

/**
 * OpenAI GPT Client
 * Handles communication with OpenAI's GPT models
 */
class GPTClient {
  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is required for GPT client');
    }
    
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      dangerouslyAllowBrowser: true // Note: In production, use server-side API calls
    });
  }

  /**
   * Generate resume content using GPT
   * @param {Object} params - Generation parameters
   * @returns {Promise<Object>} - Generated content
   */
  async generateResumeContent({ jobDescription, resumeText, selectedSkills }) {
    try {
      const prompt = `You are an expert resume writer. Based on the job description and resume text provided, generate 3-5 compelling bullet points for each selected skill that would be relevant for this position.

Job Description:
${jobDescription}

Resume Text:
${resumeText}

Selected Skills to generate bullets for:
${selectedSkills.join(', ')}

Generate bullet points that:
1. Are specific and quantifiable when possible
2. Use strong action verbs
3. Highlight relevant achievements
4. Match the job requirements
5. Are ATS-friendly

Format the response as a JSON object with this structure:
{
  "bullets": [
    {
      "skill": "skill_name",
      "bullets": [
        "bullet point 1",
        "bullet point 2",
        "bullet point 3"
      ]
    }
  ],
  "coverLetter": "A compelling cover letter paragraph that ties the candidate's experience to the job requirements"
}

Ensure the JSON is valid and properly formatted.`;

      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an expert resume writer and career coach. Generate professional, ATS-friendly content."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      });

      const response = completion.choices[0].message.content;
      
      // Parse JSON response
      try {
        const parsed = JSON.parse(response);
        return parsed;
      } catch (parseError) {
        console.error('Error parsing GPT response:', parseError);
        throw new Error('Invalid response format from GPT');
      }

    } catch (error) {
      console.error('Error in generateResumeContent:', error);
      throw new Error(`GPT generation failed: ${error.message}`);
    }
  }
}

export default GPTClient;

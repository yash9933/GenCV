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
        throw new Error(
          `Gemini API Error: Model not found. Please check your API key and try using 'gemini-1.5-flash' or 'gemini-1.5-pro' model.`
        );
      }

      throw new Error(`Gemini API Error: ${error.message}`);
    }
  }

  /**
   * Generate resume content as structured JSON
   * @param {Object} params - Parameters for generation
   * @param {string} params.jobDescription - Job description
   * @param {string} params.resumeText - Original resume text
   * @param {string[]} params.selectedSkills - Selected skills
   * @returns {Promise<Object>} - Parsed resume JSON
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
      const requiredKeys = [
        'name',
        'contact',
        'summary',
        'experience',
        'technical_skills',
        'education'
      ];
      const missingKeys = requiredKeys.filter((key) => !parsedResponse.hasOwnProperty(key));

      if (missingKeys.length > 0) {
        throw new Error(
          `Incomplete response from Gemini API - missing required fields: ${missingKeys.join(', ')}`
        );
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
    return `You are a professional resume parser. 
Your task: Convert the given RESUME TEXT into a structured JSON following the REQUIRED SCHEMA.
Do not include markdown, explanations, or extra text. Output ONLY valid JSON.
If data is missing, use "" or [].

RESUME TEXT:
${resumeText}

JOB DESCRIPTION (context only, do not insert directly):
${jobDescription}

SELECTED SKILLS (prioritize these if present):
${selectedSkills.join(", ")}

REQUIRED JSON SCHEMA:
{
  "name": "Full Name",
  "title": "Professional Title or Headline",
  "contact": {
    "phone": "Phone number",
    "email": "Email address",
    "linkedin": "LinkedIn URL",
    "portfolio": "Portfolio URL",
    "github": "GitHub URL"
  },
  "summary": "Professional summary paragraph",
  "experience": [
    {
      "title": "Role Title",
      "company": "Company Name",
      "location": "City, State or Country",
      "dates": "MMM YYYY - MMM YYYY",
      "responsibilities": [
        "Achievement 1",
        "Achievement 2"
      ]
    }
  ],
  "technical_skills": {
    "programming_languages": [],
    "frontend_technologies": [],
    "backend_technologies": [],
    "database_management": [],
    "project_program_management": [],
    "business_analysis_documentation": [],
    "data_reporting_tools": [],
    "collaboration_communication": [],
    "testing_quality_assurance": [],
    "tools_methodologies": [],
    "version_control_cloud": []
  },
  "certifications": [
    "Certification 1",
    "Certification 2"
  ],
  "volunteer": {
    "title": "Volunteer Role Title",
    "organization": "Organization Name, Location",
    "dates": "MMM YYYY - MMM YYYY",
    "responsibilities": [
      "Responsibility 1",
      "Responsibility 2"
    ]
  },
  "education": [
    {
      "degree": "Degree name",
      "institution": "University name",
      "location": "City, State or Country",
      "graduation_date": "MMM YYYY"
    }
  ]
}

RULES:
1. Always return ONLY JSON, no markdown, no explanations.
2. Dates must be in "MMM YYYY" with UPPERCASE months (JAN, FEB, MAR...).
3. If a field is missing, output "" or [] (not null).
4. Map every skill into the correct technical_skills bucket:
   - Jira, Asana, MS Project → project_program_management
   - SQL, Power BI, SharePoint → data_reporting_tools
   - Test plans, QA → testing_quality_assurance
   - Communication tools (Slack, Teams) → collaboration_communication
   - Java, Python, etc. → programming_languages
5. Do NOT create "Other Skills".
6. Flatten all bullets into "responsibilities" arrays for experience and volunteer sections.
7. Extract certifications from the resume text (PMP, CAPM, CSM, etc.).
8. Ensure valid JSON with double quotes only.`;
  }
}

export default GeminiClient;
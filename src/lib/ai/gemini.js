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
      console.log('Prompt length:', prompt.length);
      console.log('Prompt preview:', prompt.substring(0, 300) + '...');

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      console.log('Gemini API response received successfully');
      console.log('Response length:', text.length);
      console.log('Response preview:', text.substring(0, 300) + '...');
      return text;
    } catch (error) {
      console.error('Gemini API Error:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.status,
        code: error.code
      });

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
        'education',
        'projects'
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
   * Generate bullet points for specific skills
   * @param {Object} params - Parameters for bullet generation
   * @param {string} params.jobDescription - Job description
   * @param {string} params.resumeText - Original resume text
   * @param {string[]} params.selectedSkills - Selected skills to generate bullets for
   * @returns {Promise<Object>} - Generated bullet points and cover letter
   */
  async generateBulletPoints({ jobDescription, selectedSkills }) {
    const prompt = this.buildBulletPrompt({ jobDescription, selectedSkills });

    try {
      const response = await this.generateContent(prompt);

      // Parse the JSON response
      let parsedResponse;
      try {
        console.log('Raw Gemini bullet response:', response);
        parsedResponse = JSON.parse(response);
      } catch (parseError) {
        console.error('Failed to parse Gemini bullet response as JSON:', parseError);
        
        // Try to clean the response and parse again
        try {
          const cleanedResponse = response.trim();
          const jsonStart = cleanedResponse.indexOf('{');
          const jsonEnd = cleanedResponse.lastIndexOf('}') + 1;
          if (jsonStart !== -1 && jsonEnd !== -1) {
            const jsonOnly = cleanedResponse.substring(jsonStart, jsonEnd);
            console.log('Attempting to parse cleaned bullet JSON:', jsonOnly);
            parsedResponse = JSON.parse(jsonOnly);
          } else {
            throw new Error('No JSON object found in bullet response');
          }
        } catch (cleanError) {
          console.error('Failed to clean and parse bullet response:', cleanError);
          throw new Error('Invalid JSON response from Gemini API for bullet generation. Please try again.');
        }
      }

      // Sanitize bullets: remove trailing " at <Company>" phrases
      try {
        if (parsedResponse && Array.isArray(parsedResponse.bullets)) {
          parsedResponse.bullets = parsedResponse.bullets.map(group => {
            const cleaned = { ...group };
            if (Array.isArray(cleaned.bullets)) {
              cleaned.bullets = cleaned.bullets.map(b => {
                if (typeof b !== 'string') return b;
                // Remove patterns like " at Company", " at ACME Corp", optional trailing period
                return b.replace(/\s+at\s+[A-Za-z0-9&.,'()\-\s]+\.?$/i, '').trim();
              });
            }
            return cleaned;
          });
        }
      } catch (_) {}

      return parsedResponse;
    } catch (error) {
      console.error('Error in generateBulletPoints:', error);
      throw error;
    }
  }

  /**
   * Build the prompt for bullet generation
   * @param {Object} params - Parameters for prompt building
   * @returns {string} - Formatted prompt
   */
  buildBulletPrompt({ jobDescription, selectedSkills }) {
    return `You are an expert technical recruiter and career coach. 
Your task is to generate resume bullet points and a cover letter for a candidate.

TASK 1: Generate NEW resume bullet points based ONLY on the job description and selected skills (do not reuse the candidate's original resume text).

BULLET GENERATION RULES:
- Each bullet must showcase one selected skill.
- Do not reuse or reword text from the candidate's resume.
- Follow STAR: Situation/Task, Action, Result in one concise sentence.
- Each bullet: 12–20 words, strong action verbs, professional tone.
- 30–50% of bullets should include realistic metrics (time saved, %, $, users). Others should focus on scope or collaboration.
- Generate up to 2 bullets per skill (different angles).
- Keep ATS-friendly: naturally include JD keywords, but don't keyword stuff.
- No "I"/"we", no fluff, no buzzwords like "synergy".

TASK 2: Generate a professional cover letter using the engineered prompt below.

COVER LETTER GENERATION RULES:
- Structure: 
  1. Header (Candidate info + Company info placeholders).
  2. Greeting (e.g., "Dear Hiring Manager,").
  3. Opening paragraph: engaging introduction, express enthusiasm, briefly tie background to JD.
  4. Body paragraphs: highlight **2–3 strongest skills/achievements** derived from the generated bullets and aligned to the JD.
     - Avoid re-listing entire resume; instead, reframe bullets into a compelling narrative.
     - Showcase impact with STAR method (Situation, Task, Action, Result).
  5. Closing paragraph: reinforce enthusiasm, show cultural fit, call to action ("I'd welcome the chance to discuss further").
  6. Professional sign-off.

- Tone: 
  - Engaging but professional. 
  - Not robotic, not keyword-stuffed, not a rehash of resume. 
  - Show personality and motivation while staying concise and businesslike.
  - Balance confidence with humility (avoid "I am the best").
  - ATS-friendly: include job title + company naturally.

- Length: 3–5 paragraphs, total 250–350 words.
- Use varied sentence structures (avoid repetitive phrasing).
- Integrate 1–2 realistic metrics/numbers where appropriate (from bullets), but don't overdo it.
- Avoid clichés ("fast learner", "passionate about technology"), instead use evidence-based strengths.
- Maintain consistent tense, first person voice ("I" statements are okay in cover letters, unlike resumes).

INPUTS:
- JOB DESCRIPTION:
${jobDescription}

- SELECTED SKILLS (for bullet generation):
${selectedSkills.join(', ')}

OUTPUT JSON FORMAT:
{
  "bullets": [
    {
      "skill": "<one_selected_skill>",
      "bullets": [
        "<bullet 1>",
        "<bullet 2>"
      ]
    }
  ],
  "coverLetter": "Dear Hiring Manager,\n\n[Full professional cover letter following the engineered prompt structure above - 250-350 words, 3-5 paragraphs, engaging but professional tone, incorporating the generated bullets and aligning strictly to the job description and selected skills. Do not use any resume content.]\n\n\n\nSincerely,\n[First Last Name]"
}

Return ONLY valid JSON.`;
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

IMPORTANT: When parsing projects, extract ALL projects found in the resume dynamically:
- Parse ANY number of projects (0, 1, 2, 3, 4, 5, or more)
- Each project should have a complete name (not empty)
- All technologies listed in the project header (e.g., "Project Name | Tech1, Tech2, Tech3")
- A combined description from all bullet points for that project
- Handle duplicate project names if they appear (treat as separate projects)
- If no projects section exists, return empty array []
- If projects section exists but is empty, return empty array []

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
      ],
      "tech_stack": ["Technology1", "Technology2", "Technology3"]
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
  ],
  "projects": [
    {
      "name": "Project Name",
      "url": "https://project-url.com",
      "technologies": ["Tech1", "Tech2"],
      "description": "",
      "bullets": [
        "First bullet point about the project",
        "Second bullet point about the project",
        "Third bullet point about the project"
      ]
    },
    {
      "name": "Another Project",
      "technologies": ["Tech3", "Tech4"],
      "description": "",
      "bullets": [
        "First bullet point about another project",
        "Second bullet point about another project"
      ]
    },
    {
      "name": "Third Project",
      "technologies": ["Tech5", "Tech6", "Tech7"],
      "description": "",
      "bullets": [
        "First bullet point about third project",
        "Second bullet point about third project",
        "Third bullet point about third project"
      ]
    }
  ]
}

RULES:
1. Always return ONLY JSON, no markdown, no explanations.
2. Dates must be in "MMM YYYY" with UPPERCASE months (JAN, FEB, MAR...).
3. If a field is missing, output "" or [] (not null).
4. STRICT SKILL HEADERS: Only use the following keys in technical_skills and NEVER invent new ones. If you find skills that don't clearly fit, choose the closest bucket below and DO NOT add an "other" key.
   Allowed keys (exactly these snake_case keys):
   - programming_languages
   - frontend_technologies
   - backend_technologies
   - database_management
   - project_program_management
   - business_analysis_documentation
   - data_reporting_tools
   - collaboration_communication
   - testing_quality_assurance
   - tools_methodologies
   - version_control_cloud
   Mapping guidance and examples:
   • Jira, Asana, MS Project → project_program_management
   • Requirements gathering, Process mapping, Documentation → business_analysis_documentation
   • SQL, Power BI, SharePoint → data_reporting_tools
   • Slack, Microsoft Teams → collaboration_communication
   • Test plans, QA, UAT → testing_quality_assurance
   • Git, GitHub, GitLab, AWS, Azure, GCP → version_control_cloud
   • Agile, Scrum, Kanban → tools_methodologies
   • Java, Python, JavaScript → programming_languages
   • React, Vue, Angular, Tailwind → frontend_technologies
   • Node.js, Django, Spring → backend_technologies
5. Do NOT create any extra headers like "other", "misc", or custom categories. Only the allowed keys above.
6. Flatten all bullets into "responsibilities" arrays for experience and volunteer sections.
7. Extract tech stack from experience entries:
   - Look for "Tech Stack:" lines after bullet points in each experience entry
   - Parse technologies as comma-separated values into the tech_stack array
   - If no tech stack is mentioned, use empty array [] (do not generate or infer tech stack)
8. Extract certifications from the resume text (PMP, CAPM, CSM, etc.).
9. Extract contact links from the resume text:
   - Look for GitHub URLs (github.com/username) and extract into contact.github
   - Look for Portfolio/Website URLs and extract into contact.portfolio
   - Look for LinkedIn URLs (linkedin.com/in/username) and extract into contact.linkedin
   - If no URLs found, use empty string ""
10. Extract ALL projects from the resume text dynamically:
   - Parse ANY number of projects found (0 to N projects)
   - Each project should have: name, url, technologies array, description, and bullets array
   - Do not create empty project entries
   - For bullets: Extract each bullet point (•) as a separate string in the bullets array
   - For description: Only create a brief summary (1-2 sentences) if there are no bullet points. If bullets exist, leave description empty or as a brief project overview
   - For url: Look for URLs associated with each project (github.com, project websites, demo links, etc.) and extract into the url field. If no URL found, use empty string ""
   - Technologies should be extracted from the project header (e.g., "Project Name | Tech1, Tech2, Tech3")
   - Handle duplicate project names as separate entries if they appear
   - If no projects section exists, return empty array []
   - If projects section exists but is empty, return empty array []
11. Ensure valid JSON with double quotes only.`;
  }
}

export default GeminiClient;
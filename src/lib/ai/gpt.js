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
  async generateResumeContent({ jobDescription, selectedSkills, resumeMetadata, selectedBullets }) {
    try {
      const prompt = `You are an expert technical recruiter and career coach. 
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
  4. Body paragraphs: highlight **2–3 strongest skills/achievements** drawn from selected resume bullets, aligned to JD. 
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

Job Description:
${jobDescription}

Candidate Metadata:
${resumeMetadata ? JSON.stringify(resumeMetadata, null, 2) : 'Not provided'}

Selected Resume Bullets (use these for cover letter content):
${selectedBullets ? selectedBullets.map(bullet => `• ${bullet}`).join('\n') : 'Not provided'}

Selected Skills (for bullet generation):
${selectedSkills.join(', ')}

Format the response as a JSON object with this structure:
{
  "bullets": [
    {
      "skill": "skill_name",
      "bullets": [
        "bullet point 1",
        "bullet point 2"
      ]
    }
  ],
  "coverLetter": "Dear Hiring Manager,\n\n[Full professional cover letter following the engineered prompt structure above - 250-350 words, 3-5 paragraphs, engaging but professional tone, incorporating selected bullets and candidate metadata]\n\n\n\nSincerely,\n[First Last Name]"
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

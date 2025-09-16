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
- Each bullet must be exactly ONE sentence, 18–28 words maximum.
- Use compressed STAR format: Situation/Task + Action + Result in one concise sentence.
- Begin with strong action verbs, but vary phrasing across bullets (don't start all with "Implemented").
- Include numerical/metric results in 80% of generated bullets (time saved, %, $, users, performance improvements, etc.).
- Mention tools/technologies naturally in context (e.g., "using AWS Lambda" instead of "AWS Lambda" at the end).
- Keep tone professional, ATS-friendly, and human-written. Avoid clichés ("hardworking," "results-driven") and robotic phrasing.
- Each bullet must showcase one selected skill with measurable business or technical impact.
- Generate up to 2 bullets per skill (different angles).
- No "I"/"we", no fluff, no buzzwords like "synergy".
- Focus on impact and outcomes, not just tasks performed.

EXAMPLE TRANSFORMATION:
BEFORE (bland): "Migrated a legacy application to AWS, resulting in a 30% reduction in infrastructure costs."
AFTER (impactful): "Migrated a large-scale legacy application to AWS, reducing infrastructure costs by 30% while improving scalability and modernizing the system for long-term reliability."

BEFORE (bland): "Implemented AWS Lambda functions for serverless architecture, improving application scalability."
AFTER (impactful): "Implemented AWS Lambda functions to introduce serverless architecture, reducing response time by 40% and cutting operational costs by $15K annually."

BEFORE (bland): "Optimized database queries to improve performance."
AFTER (impactful): "Optimized database queries using indexing strategies, reducing query execution time by 60% and improving user experience for 10K+ daily active users."

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

Job Description:
${jobDescription}

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
  "coverLetter": "Dear Hiring Manager,\n\n[Full professional cover letter following the engineered prompt structure above - 250-350 words, 3-5 paragraphs, engaging but professional tone, incorporating the generated bullets and aligning strictly to the job description and selected skills. Do not use any resume content.]\n\n\n\nSincerely,\n[First Last Name]"
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

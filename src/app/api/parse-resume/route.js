import { NextResponse } from 'next/server';
import AIClientFactory from '../../../lib/ai/index';

/**
 * POST /api/parse-resume
 * Parses resume text into structured JSON and extracts relevant skills from job description
 */
export async function POST(request) {
  try {
    console.log('API: Starting resume parsing and skill extraction...');
    console.log('API: Request received at /api/parse-resume');
    
    // Parse request body
    const body = await request.json();
    const { jobDescription, resumeText } = body;

    // Validate inputs
    if (!jobDescription || !resumeText) {
      console.error('API: Missing required fields in request');
      return NextResponse.json(
        { error: 'Missing required fields: jobDescription, resumeText' },
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
    
    // Check if Gemini API key is available
    const geminiApiKey = process.env.GEMINI_API_KEY;
    console.log('API: Gemini API key available:', geminiApiKey ? 'Yes' : 'No');
    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not set');
    }
    
    // Use Gemini for parsing (it's better at structured data extraction)
    const aiProvider = 'gemini';
    console.log(`API: Using ${aiProvider.toUpperCase()} AI provider for parsing`);

    // Parse resume text into structured JSON
    console.log('API: Parsing resume text into structured JSON...');
    console.log('API: Resume text length:', resumeText.length);
    console.log('API: Resume text preview:', resumeText.substring(0, 200) + '...');
    console.log('API: Job description length:', jobDescription.length);
    console.log('API: Job description preview:', jobDescription.substring(0, 200) + '...');
    
    let parsedResume;
    try {
      parsedResume = await aiFactory.generateResumeContent(
        aiProvider,
        {
          jobDescription: jobDescription || '',
          resumeText,
          selectedSkills: [] // Empty for initial parsing
        }
      );
      console.log('API: Resume parsing completed successfully');
      console.log('API: Parsed resume structure:', Object.keys(parsedResume));
      console.log('API: Parsed resume content:', JSON.stringify(parsedResume, null, 2));
    } catch (aiError) {
      console.error('API: Error calling AI for resume parsing:', aiError);
      throw new Error(`AI parsing failed: ${aiError.message}`);
    }

    // Normalize technical_skills headers to canonical keys
    parsedResume = normalizeTechnicalSkillsHeaders(parsedResume);

    // Extract skills from the parsed resume and job description
    const extractedSkills = extractSkillsFromResume(parsedResume, jobDescription);
    console.log('API: Extracted skills:', extractedSkills);

    // Return parsed resume and extracted skills
    return NextResponse.json({
      success: true,
      data: {
        parsedResume: parsedResume,
        suggestedSkills: extractedSkills
      }
    });

  } catch (error) {
    console.error('API: Error in resume parsing:', error);
    
    // Return appropriate error response
    return NextResponse.json(
      { 
        error: 'Failed to parse resume and extract skills',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

/**
 * Extract relevant skills from job description only
 */
function extractSkillsFromResume(parsedResume, jobDescription) {
  const skills = new Set();
  
  // Extract skills ONLY from job description
  const jdSkills = extractTechTermsFromText(jobDescription);
  jdSkills.forEach(skill => skills.add(skill));
  
  // Convert to array and sort
  return Array.from(skills).sort();
}

/**
 * Extract technical terms and tools from text
 */
function extractTechTermsFromText(text) {
  if (!text || typeof text !== 'string') return [];
  
  const techTerms = new Set();
  
  // Common technical terms and tools
  const techPatterns = [
    // Programming languages
    /\b(JavaScript|TypeScript|Python|Java|C\+\+|C#|PHP|Ruby|Go|Rust|Swift|Kotlin|Scala|R|MATLAB)\b/gi,
    // Frameworks and libraries
    /\b(React|Angular|Vue|Node\.js|Express|Django|Flask|Spring|Laravel|Rails|ASP\.NET|jQuery|Bootstrap|Tailwind)\b/gi,
    // Databases
    /\b(MySQL|PostgreSQL|MongoDB|Redis|Elasticsearch|Oracle|SQL Server|SQLite|DynamoDB|Cassandra)\b/gi,
    // Cloud platforms
    /\b(AWS|Azure|GCP|Google Cloud|Amazon Web Services|Microsoft Azure|Docker|Kubernetes|Terraform)\b/gi,
    // Tools and methodologies
    /\b(Git|GitHub|GitLab|Jenkins|CI\/CD|Agile|Scrum|DevOps|JIRA|Confluence|Slack|Teams|Figma|Photoshop)\b/gi,
    // Data and analytics
    /\b(Tableau|Power BI|Excel|SQL|NoSQL|Machine Learning|AI|Data Science|Analytics|ETL)\b/gi,
    // Testing
    /\b(Jest|Mocha|Cypress|Selenium|Unit Testing|Integration Testing|TDD|BDD)\b/gi
  ];
  
  techPatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach(match => {
        techTerms.add(match.trim());
      });
    }
  });
  
  return Array.from(techTerms);
}

// Map arbitrary/variant technical skill headers to canonical keys and prune extras
function normalizeTechnicalSkillsHeaders(resume) {
  try {
    const canonicalKeys = new Set([
      'programming_languages',
      'frontend_technologies',
      'backend_technologies',
      'database_management',
      'project_program_management',
      'business_analysis_documentation',
      'data_reporting_tools',
      'collaboration_communication',
      'testing_quality_assurance',
      'tools_methodologies',
      'version_control_cloud',
    ]);

    const synonyms = [
      { match: [/programming\s*languages?/i, /languages?/i, /coding/i], key: 'programming_languages' },
      { match: [/front\s*end/i, /frontend/i, /ui\s*technolog/i], key: 'frontend_technologies' },
      { match: [/back\s*end/i, /backend/i, /server\s*side/i], key: 'backend_technologies' },
      { match: [/database/i, /data\s*stores?/i, /sql\s*databases?/i], key: 'database_management' },
      { match: [/project/i, /program\s*management/i, /pm\b/i], key: 'project_program_management' },
      { match: [/business\s*analysis/i, /documentation/i, /requirements/i], key: 'business_analysis_documentation' },
      { match: [/data\s*report/i, /analytics?/i, /bi\b/i], key: 'data_reporting_tools' },
      { match: [/collaboration/i, /communication/i, /teams?|slack/i], key: 'collaboration_communication' },
      { match: [/testing/i, /qa\b/i, /quality\s*assurance/i, /uat/i], key: 'testing_quality_assurance' },
      { match: [/tools?/i, /methodolog/i, /agile|scrum|kanban/i], key: 'tools_methodologies' },
      { match: [/version\s*control/i, /git/i, /cloud/i, /aws|azure|gcp/i], key: 'version_control_cloud' },
    ];

    const normalized = { ...resume };
    const incoming = (resume && resume.technical_skills) || {};
    const result = {};

    // Initialize all canonical keys as arrays
    canonicalKeys.forEach((k) => { result[k] = Array.isArray(incoming[k]) ? incoming[k] : []; });

    // Fold any non-canonical keys into the closest canonical bucket
    Object.keys(incoming).forEach((key) => {
      if (canonicalKeys.has(key)) return;
      const values = Array.isArray(incoming[key]) ? incoming[key] : (incoming[key] ? [incoming[key]] : []);
      const canonical = (synonyms.find(({ match }) => match.some((r) => r.test(key))) || {}).key;
      if (canonical) {
        result[canonical] = [...result[canonical], ...values];
      }
    });

    normalized.technical_skills = result;
    return normalized;
  } catch (_) {
    return resume;
  }
}
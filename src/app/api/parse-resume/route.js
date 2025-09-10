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
  const lowerText = text.toLowerCase();
  
  // Comprehensive technical terms and tools with case-insensitive matching
  const techPatterns = [
    // Programming languages
    /\b(javascript|typescript|python|java|c\+\+|c#|php|ruby|go|rust|swift|kotlin|scala|r|matlab|perl|bash|shell|powershell)\b/gi,
    
    // Java ecosystem
    /\b(spring|spring mvc|spring boot|spring framework|hibernate|jpa|java persistence api|maven|gradle|junit|mockito|jvm|jdk|jre)\b/gi,
    
    // Frameworks and libraries
    /\b(react|angular|vue|vue\.js|node\.js|nodejs|express|django|flask|laravel|rails|asp\.net|jquery|bootstrap|tailwind|next\.js|nuxt\.js|svelte|ember)\b/gi,
    
    // JavaScript frameworks and libraries
    /\b(javascript frameworks|js frameworks|react\.js|angular\.js|vue\.js|jquery|lodash|underscore|moment\.js|axios|fetch api)\b/gi,
    
    // Web development technologies
    /\b(html|html5|css|css3|ajax|xml|json|rest|restful|graphql|websockets|webpack|babel|es6|es2015|es2016|es2017|es2018|es2019|es2020)\b/gi,
    
    // Modern web development concepts
    /\b(single-page applications|spa|progressive web apps|pwa|responsive design|mobile web development|web components|micro frontends)\b/gi,
    
    // Programming paradigms and design patterns
    /\b(object oriented programming|oop|object-oriented programming|design patterns|domain driven design|ddd|functional programming|fp|mvc|mvp|mvvm|microservices|soa)\b/gi,
    
    // Databases
    /\b(mysql|postgresql|mongodb|redis|elasticsearch|oracle|sql server|sqlite|dynamodb|cassandra|neo4j|influxdb|couchdb|mariadb)\b/gi,
    
    // Cloud platforms and infrastructure
    /\b(aws|amazon web services|azure|microsoft azure|gcp|google cloud|docker|kubernetes|terraform|ansible|chef|puppet|jenkins|gitlab ci|github actions)\b/gi,
    
    // Development tools and methodologies
    /\b(git|github|gitlab|bitbucket|svn|mercurial|jira|confluence|slack|teams|figma|sketch|photoshop|illustrator|agile|scrum|kanban|devops|ci\/cd|continuous integration|continuous deployment)\b/gi,
    
    // Data and analytics
    /\b(tableau|power bi|excel|sql|nosql|machine learning|ml|artificial intelligence|ai|data science|analytics|etl|data warehousing|business intelligence|bi)\b/gi,
    
    // Testing frameworks and methodologies
    /\b(jest|mocha|chai|cypress|selenium|webdriver|unit testing|integration testing|end-to-end testing|e2e testing|tdd|test driven development|bdd|behavior driven development|qa|quality assurance)\b/gi,
    
    // Server-side development
    /\b(server-side development|backend development|api development|web services|microservices|server applications|restful services|soap|grpc)\b/gi,
    
    // Mobile development
    /\b(ios|android|react native|flutter|xamarin|cordova|phonegap|mobile development|hybrid apps|native apps)\b/gi,
    
    // Operating systems and environments
    /\b(linux|unix|windows|macos|ubuntu|centos|debian|red hat|fedora|freebsd|openbsd)\b/gi,
    
    // Version control and collaboration
    /\b(version control|source control|code review|pull request|merge request|branching|tagging|release management)\b/gi,
    
    // Performance and monitoring
    /\b(performance optimization|caching|load balancing|monitoring|logging|debugging|profiling|apm|application performance monitoring)\b/gi
  ];
  
  // Apply patterns to find matches
  techPatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach(match => {
        // Clean up the match and add to set
        const cleanedMatch = match.trim();
        if (cleanedMatch) {
          techTerms.add(cleanedMatch);
        }
      });
    }
  });
  
  // Additional specific term extraction for common variations
  const specificTerms = [
    // Server-side development variations
    { pattern: /server[-\s]?side\s+development/gi, term: 'Server-side development' },
    { pattern: /backend\s+development/gi, term: 'Backend development' },
    { pattern: /server\s+applications?/gi, term: 'Server applications' },
    
    // Java ecosystem specific
    { pattern: /spring\s+mvc/gi, term: 'Spring MVC' },
    { pattern: /java\s+persistence\s+api/gi, term: 'JPA' },
    { pattern: /object[-\s]?oriented\s+programming/gi, term: 'Object-Oriented Programming (OOP)' },
    { pattern: /design\s+patterns/gi, term: 'Design patterns' },
    { pattern: /domain[-\s]?driven\s+design/gi, term: 'Domain-Driven Design (DDD)' },
    
    // Web development specific
    { pattern: /javascript\s+frameworks?/gi, term: 'JavaScript frameworks' },
    { pattern: /modern\s+web\s+development/gi, term: 'Modern web development' },
    { pattern: /single[-\s]?page\s+applications?/gi, term: 'Single-page applications' },
    { pattern: /mobile\s+web\s+development/gi, term: 'Mobile web development' },
    { pattern: /html5/gi, term: 'HTML5' },
    { pattern: /css3/gi, term: 'CSS3' },
    { pattern: /ajax/gi, term: 'AJAX' },
    
    // Leadership and management
    { pattern: /technical\s+leadership/gi, term: 'Technical leadership' },
    { pattern: /team\s+leadership/gi, term: 'Team leadership' },
    { pattern: /mentoring/gi, term: 'Mentoring' },
    { pattern: /remote\s+team\s+management/gi, term: 'Remote team management' },
    { pattern: /distributed\s+team\s+management/gi, term: 'Distributed team management' }
  ];
  
  // Remove duplicates and normalize case
  const normalizeAndDeduplicate = (terms) => {
    const normalized = new Set();
    const seen = new Set();
    
    terms.forEach(term => {
      const lower = term.toLowerCase();
      if (!seen.has(lower)) {
        seen.add(lower);
        normalized.add(term);
      }
    });
    
    return Array.from(normalized);
  };
  
  specificTerms.forEach(({ pattern, term }) => {
    if (pattern.test(text)) {
      techTerms.add(term);
    }
  });
  
  // Apply deduplication and return sorted results
  return normalizeAndDeduplicate(Array.from(techTerms)).sort();
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
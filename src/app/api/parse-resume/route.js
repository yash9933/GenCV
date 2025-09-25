import { NextResponse } from 'next/server';
import AIClientFactory from '../../../lib/ai/index';

/**
 * POST /api/parse-resume
 * Parses resume text into structured JSON and extracts relevant skills from job description using AI
 * 
 * This endpoint:
 * 1. Parses raw resume text into structured JSON format
 * 2. Extracts skills from job description using AI (no hardcoded patterns)
 * 3. Normalizes technical skills headers to canonical format
 * 4. Returns both parsed resume and suggested skills
 */
export async function POST(request) {
  try {
    // Parse request body
    const body = await request.json();
    const { jobDescription, resumeText } = body;

    // Validate inputs
    if (!jobDescription || !resumeText) {
      return NextResponse.json(
        { error: 'Missing required fields: jobDescription, resumeText' },
        { status: 400 }
      );
    }

    // Initialize AI client factory
    const aiFactory = new AIClientFactory();
    const availableProviders = aiFactory.getAvailableProviders();
    
    if (availableProviders.length === 0) {
      throw new Error('No AI providers are available. Please check your API keys.');
    }
    
    // Use Gemini for parsing (it's better at structured data extraction)
    const aiProvider = 'gemini';

    // Parse resume text into structured JSON
    const parsedResume = await aiFactory.generateResumeContent(
      aiProvider,
      {
        jobDescription: jobDescription || '',
        resumeText,
        selectedSkills: [] // Empty for initial parsing
      }
    );

    // Normalize technical_skills headers to canonical keys
    const normalizedResume = normalizeTechnicalSkillsHeaders(parsedResume);

    // Extract skills from job description using AI
    let extractedSkills = await aiFactory.extractSkillsFromJobDescription(
      aiProvider,
      jobDescription
    );

    // Post-process to filter out unwanted skills
    extractedSkills = filterHardSkillsOnly(extractedSkills);

    // Return parsed resume and extracted skills
    return NextResponse.json({
      success: true,
      data: {
        parsedResume: normalizedResume,
        suggestedSkills: extractedSkills
      }
    });

  } catch (error) {
    console.error('Error in resume parsing:', error);
    
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
 * Filter skills to include only hard technical skills
 * @param {Array} skills - Array of extracted skills
 * @returns {Array} - Filtered array of hard technical skills only
 */
function filterHardSkillsOnly(skills) {
  if (!Array.isArray(skills)) return [];

  // Skills to exclude (soft skills, generic terms, methodologies)
  const excludeList = [
    // Soft skills and methodologies
    'agile', 'scrum', 'leadership', 'communication', 'problem solving', 'team collaboration',
    'analytical skills', 'creativity', 'mentoring', 'project management',
    
    // Generic terms and concepts
    'core web vitals', 'seo', 'schema', 'security hardening', 'custom themes', 
    'custom post types', 'paragraphs', 'views', 'csv', 'xml', 'json',
    'testing frameworks', 'user roles', 'permissions', 'content migration',
    'responsive layouts', 'ui design', 'marketing tools', 'social media marketing',
    'data normalization', 'content modeling', 'image pipelines', 'microsites',
    'menus', 'taxonomies', 'section 508', 'wcag 2.2 aa', 'caching', 'cdns',
    'api integrations', 'cms', 'headless', 'plugin development', 'rest',
    'ga4', 'gtm', 'looker studio', 'inp', 'lcp'
  ];

  // Filter out excluded skills and limit to 20 most relevant
  const filtered = skills
    .filter(skill => {
      if (!skill || typeof skill !== 'string') return false;
      const lowerSkill = skill.toLowerCase().trim();
      return !excludeList.includes(lowerSkill) && lowerSkill.length > 1;
    })
    .slice(0, 20); // Limit to 20 skills

  return filtered;
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
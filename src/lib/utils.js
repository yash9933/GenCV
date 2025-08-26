
/**
 * Utility functions for AI Resume Builder (FINAL FULL VERSION WITH SMARTER DETECTION)
 */

// -------------------- Resume Extraction --------------------

export const extractResumeToJSON = (resumeText) => {
  if (!resumeText) return {};

  const resume = {
    name: "",
    contact: {
      phone: "",
      email: "",
      portfolio: "",
      linkedin: "",
      github: ""
    },
    summary: "",
    experience: [],
    skills: {
      programming_languages: [],
      frontend_technologies: [],
      database_management: [],
      backend_technologies: [],
      tools_methodologies: [],
      development_tools: [],
      version_control_cloud: []
    },
    projects: [],
    education: []
  };

  const text = formatResumeText(resumeText);
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);

  // ---- Smarter Name Detection ----
  const nameLine = lines.find(l =>
    /^[A-Z][a-z]+\s+[A-Z][a-z]+/.test(l) && l.split(" ").length <= 4
  );
  resume.name = nameLine || (lines[0] || "");

  // ---- Contact ----
  if (lines.length > 1) {
    const cl = lines[1];
    const emailMatch = cl.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/);
    if (emailMatch) resume.contact.email = emailMatch[0];
    const phoneMatch = cl.match(/(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
    if (phoneMatch) resume.contact.phone = phoneMatch[0];
    if (/portfolio/i.test(cl)) resume.contact.portfolio = "Portfolio";
    if (/linkedin/i.test(cl)) resume.contact.linkedin = "LinkedIn";
    if (/github/i.test(cl)) resume.contact.github = "GitHub";
  }

  // ---- Section buckets ----
  const HEADER_RE = /^(SUMMARY|PROFESSIONAL (SUMMARY|EXPERIENCE)|EXPERIENCE|WORK EXPERIENCE|EDUCATION|PROJECTS?|TECHNICAL SKILLS|SKILLS?|CERTIFICATIONS?|LANGUAGES?|AWARDS?|VOLUNTEER|INTERESTS?)[:]?$/i;
  const buckets = {};
  let current = null;
  for (let line of lines) {
    if (HEADER_RE.test(line)) {
      current = line.toUpperCase().replace(/\s+/g, " ").replace(/:$/, "");
      buckets[current] = [];
      continue;
    }
    if (current) buckets[current].push(line);
  }

  // ---- Summary ----
  if (buckets["SUMMARY"]) resume.summary = buckets["SUMMARY"].join(" ").trim();

  // ---- Experience ----
  const expLines = buckets["PROFESSIONAL EXPERIENCE"] || buckets["WORK EXPERIENCE"] || buckets["EXPERIENCE"] || [];
  resume.experience = parseExperience(expLines);

  // ---- Education ----
  resume.education = parseEducation(buckets["EDUCATION"] || []);

  // ---- Skills ----
  resume.skills = parseSkills(buckets["TECHNICAL SKILLS"] || buckets["SKILLS"] || []);

  // ---- Projects ----
  resume.projects = parseProjects(buckets["PROJECTS"] || []);

  return resume;
};

const parseExperience = (lines) => {
  const exps = [];
  let current = null;

  const isBullet = (s) => /^[•\-\*]/.test(s);
  const isDate = (s) => /^\d{2}\/\d{4}\s*[-–]\s*(Present|\d{2}\/\d{4})$/i.test(s);

  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (!l) continue;

    if (l.includes("|")) {
      if (current) exps.push(current);
      current = { title: "", company: "", location: "", start_date: "", end_date: "", achievements: [], tech_stack: [] };

      const [left, right] = l.split("|").map(x => x.trim());
      current.title = left;
      if (right.includes(",")) {
        const idx = right.indexOf(",");
        current.company = right.slice(0, idx).trim();
        current.location = right.slice(idx + 1).trim();
      } else {
        current.company = right;
      }

      // Next line might be date
      if (i + 1 < lines.length && isDate(lines[i + 1])) {
        const [sd, ed] = lines[i + 1].split(/[-–]/).map(x => x.trim());
        current.start_date = sd;
        current.end_date = ed;
        i++;
      }
      continue;
    }

    if (current) {
      if (isDate(l)) {
        const [sd, ed] = l.split(/[-–]/).map(x => x.trim());
        current.start_date = sd;
        current.end_date = ed;
      } else if (/^tech stack:/i.test(l)) {
        current.tech_stack = l.replace(/^tech stack:\s*/i, "").split(/,\s*/);
      } else if (isBullet(l)) {
        current.achievements.push(l.replace(/^[•\-\*]\s*/, "").trim());
      } else {
        current.achievements.push(l.trim());
      }
    }
  }
  if (current) exps.push(current);
  return exps;
};

const parseEducation = (lines) => {
  const edus = [];
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (!l) continue;

    if (/^\d{2}\/\d{4}$/.test(l)) {
      if (edus.length) edus[edus.length - 1].graduation_date = l;
      continue;
    }

    if (l.includes(",")) {
      // degree, institution, location
      const parts = l.split(",");
      const degree = parts[0].trim();
      const institution = parts[1] ? parts[1].trim() : "";
      const location = parts.slice(2).join(",").trim();
      edus.push({ degree, institution, location, graduation_date: "" });
    }
  }
  return edus;
};

const parseSkills = (lines) => {
  const skills = {
    programming_languages: [],
    frontend_technologies: [],
    database_management: [],
    backend_technologies: [],
    tools_methodologies: [],
    development_tools: [],
    version_control_cloud: []
  };
  const categories = {
    programming_languages: ["Java", "Python", "JavaScript", "TypeScript", "C++", "C#"],
    frontend_technologies: ["React", "Angular", "HTML5", "CSS", "JSON", "Adobe Flex"],
    database_management: ["MySQL", "PostgreSQL", "MongoDB", "NoSQL"],
    backend_technologies: ["GraphQL", "RESTful APIs", "Docker", "Kubernetes"],
    tools_methodologies: ["Atlassian JIRA", "Confluence", "Agile", "Scrum"],
    development_tools: ["Visual Studio Code", "Jenkins", "Terraform"],
    version_control_cloud: ["GitHub", "AWS", "GCP", "Azure"]
  };
  lines.forEach(l => {
    Object.keys(categories).forEach(cat => {
      categories[cat].forEach(skill => {
        if (l.toLowerCase().includes(skill.toLowerCase())) {
          skills[cat].push(skill);
        }
      });
    });
  });
  Object.keys(skills).forEach(cat => skills[cat] = [...new Set(skills[cat])]);
  return skills;
};

const parseProjects = (lines) => {
  const projects = [];
  let current = null;
  const isBullet = (s) => /^[•\-\*]/.test(s);

  for (let l of lines) {
    if (!l) continue;
    if (l.includes("|")) {
      if (current) projects.push(current);
      const [name, techs] = l.split("|").map(x => x.trim());
      current = { name, tech_stack: techs.split(/,\s*/), description: [] };
      continue;
    }
    if (current) {
      if (isBullet(l)) current.description.push(l.replace(/^[•\-\*]\s*/, "").trim());
      else current.description.push(l.trim());
    }
  }
  if (current) projects.push(current);
  return projects;
};

// -------------------- Utility Helpers --------------------

export const formatResumeText = (text) => {
  if (!text) return '';
  return text
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+$/gm, '')
    .replace(/\u2022/g, '•')
    .trim();
};

export const extractSkillsFromJD = (jobDescription) => {
  const commonSkills = [
    'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'SQL', 'AWS', 'Docker',
    'Kubernetes', 'Git', 'Agile', 'Scrum', 'REST API', 'GraphQL', 'TypeScript',
    'Angular', 'Vue.js', 'MongoDB', 'PostgreSQL', 'Redis', 'Kafka', 'Microservices',
    'CI/CD', 'Jenkins', 'Terraform', 'Ansible', 'Linux', 'Machine Learning',
    'Data Analysis', 'Project Management', 'Leadership', 'Communication',
    'Problem Solving', 'Team Collaboration', 'Analytical Skills', 'Creativity'
  ];

  const foundSkills = [];
  const lowerJD = jobDescription.toLowerCase();
  commonSkills.forEach(skill => {
    if (lowerJD.includes(skill.toLowerCase())) {
      foundSkills.push(skill);
    }
  });
  return foundSkills.slice(0, 10);
};

export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Error copying to clipboard:', error);
    return false;
  }
};

export const downloadFile = (content, filename, mimeType) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Generate a unique ID
 * @returns {string} - Unique ID
 */
export const generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};

/**
 * Extract bullet points from resume text
 * @param {string} resumeText - The resume text
 * @returns {Array} - Array of bullet point objects with toggle state
 */
export const extractBulletPoints = (resumeText) => {
  if (!resumeText) return [];
  
  // Split by common bullet point indicators - more flexible patterns
  const bulletPatterns = [
    /^[•\-\*]\s*(.+)$/gm,  // • - * at start of line
    /^[A-Z]\.\s*(.+)$/gm,  // A. B. C. at start of line
    /^[0-9]+\.\s*(.+)$/gm, // 1. 2. 3. at start of line
    /^[a-z]\)\s*(.+)$/gm,  // a) b) c) at start of line
    /^[A-Z]\)\s*(.+)$/gm,  // A) B) C) at start of line
    /\s+[•\-\*]\s*(.+)$/gm,  // • - * with leading whitespace
    /\s+[A-Z]\.\s*(.+)$/gm,  // A. B. C. with leading whitespace
    /\s+[0-9]+\.\s*(.+)$/gm, // 1. 2. 3. with leading whitespace
    /\s+[a-z]\)\s*(.+)$/gm,  // a) b) c) with leading whitespace
    /\s+[A-Z]\)\s*(.+)$/gm,  // A) B) C) with leading whitespace
  ];
  
  const bullets = [];
  let id = 1;
  
  bulletPatterns.forEach(pattern => {
    const matches = resumeText.match(pattern);
    if (matches) {
      matches.forEach(match => {
        // Use the captured group (the text after the bullet pattern)
        // The regex patterns use (.+) to capture the actual text
        const fullMatch = match;
        const textMatch = fullMatch.match(pattern);
        if (textMatch && textMatch[1]) {
          const text = textMatch[1].trim();
          if (text && text.length > 10) { // Only include substantial bullets
            bullets.push({
              id: `original-${id++}`,
              text: text,
              isEnabled: true, // Original bullets are enabled by default
              type: 'original'
            });
          }
        }
      });
    }
  });
  
  // If no bullets found with patterns, try to split by sections and sentences
  if (bullets.length === 0) {
    // Split by common section headers first
    const sections = resumeText.split(/(?=^(?:EDUCATION|EXPERIENCE|SKILLS|PROJECTS|ACHIEVEMENTS|SUMMARY|OBJECTIVE|WORK HISTORY|EMPLOYMENT|TECHNICAL SKILLS|SOFT SKILLS|LANGUAGES|CERTIFICATIONS|AWARDS|VOLUNTEER|INTERESTS|REFERENCES))/im);
    
    sections.forEach((section, sectionIndex) => {
      if (section.trim()) {
        // Split section into sentences or lines
        const sentences = section.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 10);
        
        sentences.forEach((sentence, sentenceIndex) => {
          const cleanText = sentence.trim();
          if (cleanText && cleanText.length > 10) {
            bullets.push({
              id: `original-${sectionIndex}-${sentenceIndex}`,
              text: cleanText,
              isEnabled: true,
              type: 'original'
            });
          }
        });
      }
    });
    
    // If still no bullets, treat as one bullet
    if (bullets.length === 0) {
      const cleanText = resumeText.trim();
      if (cleanText && cleanText.length > 10) {
        bullets.push({
          id: `original-1`,
          text: cleanText,
          isEnabled: true,
          type: 'original'
        });
      }
    }
  }
  
  return bullets;
};

// -------------------- Reverse Conversion --------------------

export const resumeJSONToText = (resumeData) => {
  if (!resumeData) return '';
  let text = '';

  if (resumeData.name) text += `${resumeData.name}\n`;
  if (resumeData.contact) {
    const { phone, email, portfolio, linkedin, github } = resumeData.contact;
    const parts = [phone, email, portfolio, linkedin, github].filter(Boolean);
    if (parts.length) text += parts.join(' • ') + '\n\n';
  }

  if (resumeData.summary) {
    text += `SUMMARY\n${resumeData.summary}\n\n`;
  }

  if (resumeData.experience?.length) {
    text += 'PROFESSIONAL EXPERIENCE\n';
    resumeData.experience.forEach(exp => {
      const headerRight = [exp.company, exp.location].filter(Boolean).join(', ');
      text += `${exp.title} | ${headerRight}\n`;
      if (exp.start_date || exp.end_date) {
        text += `${exp.start_date}${exp.end_date ? ' - ' + exp.end_date : ''}\n`;
      }
      exp.achievements?.forEach(a => text += `• ${a}\n`);
      if (exp.tech_stack?.length) text += `Tech Stack: ${exp.tech_stack.join(', ')}\n`;
      text += '\n';
    });
  }

  if (resumeData.skills) {
    const s = resumeData.skills;
    const addSection = (label, arr) => {
      if (arr?.length) text += `${label}\n${arr.join(', ')}\n\n`;
    };
    addSection('Programming Languages', s.programming_languages);
    addSection('Frontend Technologies', s.frontend_technologies);
    addSection('Database Management', s.database_management);
    addSection('Backend Technologies', s.backend_technologies);
    addSection('Tools & Methodologies', s.tools_methodologies);
    addSection('Development Tools', s.development_tools);
    addSection('Version Control & Cloud', s.version_control_cloud);
  }

  if (resumeData.projects?.length) {
    text += 'PROJECTS\n';
    resumeData.projects.forEach(p => {
      text += `${p.name}${p.tech_stack?.length ? ' | ' + p.tech_stack.join(', ') : ''}\n`;
      p.description?.forEach(d => text += `• ${d}\n`);
      text += '\n';
    });
  }

  if (resumeData.education?.length) {
    text += 'EDUCATION\n';
    resumeData.education.forEach(e => {
      const right = [e.institution, e.location].filter(Boolean).join(', ');
      text += `${e.degree}${right ? ' - ' + right : ''}${e.graduation_date ? ' - ' + e.graduation_date : ''}\n\n`;
    });
  }

  return text.trim();
};

/**
 * Generate complete updated resume content
 * @param {Object} data - Resume data
 * @returns {string} - Complete updated resume
 */
export const generateResumeContent = (data) => {
  const { originalResume, originalBullets, generatedBullets } = data;
  
  console.log('Generating complete resume with data:', {
    originalResumeLength: originalResume?.length,
    originalBulletsCount: originalBullets?.length,
    generatedBulletsCount: generatedBullets?.length,
    enabledOriginalBullets: originalBullets?.filter(b => b.isEnabled)?.length,
    enabledGeneratedBullets: generatedBullets?.filter(b => b.isEnabled)?.length
  });
  
  // Get all enabled bullets
  const enabledOriginalBullets = originalBullets?.filter(bullet => bullet.isEnabled) || [];
  const enabledGeneratedBullets = generatedBullets?.filter(bullet => bullet.isEnabled) || [];
  
  // Start with the original resume
  let updatedResume = originalResume;
  
  // If we have original bullets with toggles, replace the original content
  if (originalBullets && originalBullets.length > 0) {
    const lines = updatedResume.split('\n');
    const newLines = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Check if this line contains any of the original bullets
      const matchingBullet = originalBullets.find(bullet => 
        line.includes(bullet.text) || bullet.text.includes(line.trim())
      );
      
      if (matchingBullet) {
        // Only include this line if the bullet is enabled
        if (matchingBullet.isEnabled) {
          newLines.push(line);
        }
        // Skip this line if bullet is disabled
      } else {
        // Keep lines that don't match any bullets (headers, formatting, etc.)
        newLines.push(line);
      }
    }
    
    updatedResume = newLines.join('\n');
  }
  
  // Add generated bullets to the work experience section if any are enabled
  if (enabledGeneratedBullets.length > 0) {
    const lines = updatedResume.split('\n');
    const newLines = [];
    let workExperienceFound = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      newLines.push(line);
      
      // Look for work experience section headers
      if (line.match(/^(EXPERIENCE|PROFESSIONAL EXPERIENCE|WORK EXPERIENCE)/i) && !workExperienceFound) {
        workExperienceFound = true;
        
        // Find the next job title or section header
        let insertIndex = i + 1;
        for (let j = i + 1; j < lines.length; j++) {
          const nextLine = lines[j].trim();
          // If we find another section header or job title, stop here
          if (nextLine.match(/^(EDUCATION|SKILLS|PROJECTS|SUMMARY)/i) || 
              (nextLine.length > 0 && !nextLine.startsWith('•') && !nextLine.startsWith('-') && !nextLine.startsWith('*'))) {
            break;
          }
          insertIndex = j + 1;
        }
        
        // Insert generated bullets at the beginning of work experience
        const bulletLines = enabledGeneratedBullets.map(bullet => `• ${bullet.text}`);
        newLines.splice(insertIndex, 0, '', 'Generated Bullets:', '', ...bulletLines, '');
      }
    }
    
    updatedResume = newLines.join('\n');
  }
  
  console.log('Generated complete resume length:', updatedResume.length);
  console.log('Resume preview:', updatedResume.substring(0, 500));
  
  return updatedResume;
};

/**
 * Generate formatted resume preview
 * @param {Object} data - Resume data
 * @returns {string} - Formatted resume preview
 */
export const generateResumePreview = (data) => {
  const { originalResume, originalBullets, generatedBullets } = data;
  
  console.log('Preview function called with:', {
    originalBulletsCount: originalBullets?.length || 0,
    generatedBulletsCount: generatedBullets?.length || 0,
    enabledOriginalBullets: originalBullets?.filter(b => b.isEnabled).length || 0,
    enabledGeneratedBullets: generatedBullets?.filter(b => b.isEnabled).length || 0
  });
  
  // Get all enabled bullets
  const enabledOriginalBullets = originalBullets?.filter(bullet => bullet.isEnabled) || [];
  const enabledGeneratedBullets = generatedBullets?.filter(bullet => bullet.isEnabled) || [];
  
  // Create a formatted resume preview
  let preview = '';
  
  // Add header
  preview += 'PROFESSIONAL RESUME\n';
  preview += '='.repeat(50) + '\n\n';
  
  // Add original resume content (first 200 characters)
  if (originalResume) {
    const truncatedResume = originalResume.length > 200 
      ? originalResume.substring(0, 200) + '...'
      : originalResume;
    preview += truncatedResume + '\n\n';
  }
  
  // Add selected bullets section
  if (enabledOriginalBullets.length > 0 || enabledGeneratedBullets.length > 0) {
    preview += 'SELECTED BULLETS\n';
    preview += '-'.repeat(30) + '\n';
    
    // Add original bullets
    if (enabledOriginalBullets.length > 0) {
      preview += 'Original Bullets (Enabled):\n';
      enabledOriginalBullets.forEach(bullet => {
        preview += `• ${bullet.text}\n`;
      });
      preview += '\n';
    }
    
    // Add generated bullets
    if (enabledGeneratedBullets.length > 0) {
      preview += 'Generated Bullets (Will appear in Work Experience):\n';
      enabledGeneratedBullets.forEach(bullet => {
        preview += `• ${bullet.text}\n`;
      });
      preview += '\n';
    }
  }
  
  return preview;
};

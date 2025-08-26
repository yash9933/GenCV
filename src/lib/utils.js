
/**
 * Utility functions for the AI Resume Builder (patched)
 * Changes:
 * - Robust section detection now includes "PROFESSIONAL EXPERIENCE" and "WORK EXPERIENCE".
 * - Summary no longer swallows other sections.
 * - Experience parser supports dates on the next line and extracts company/location properly.
 * - Education parser supports "Degree, School, Location" with date-only lines (e.g., 05/2024) on following lines.
 * - Contact parsing keeps LinkedIn/GitHub placeholders and preserves phone/email.
 */

// -------------------- Unchanged helpers --------------------

export const parsePDF = async (file) => {
  try {
    console.log('Starting PDF parsing for file:', file.name);
    console.log('PDF upload attempted, but PDF parsing is currently disabled due to browser restrictions.');
    console.log('Please paste your resume text instead.');
    throw new Error('PDF parsing is currently disabled. Please paste your resume text instead.');
  } catch (error) {
    console.error('Error parsing PDF:', error);
    throw new Error('PDF parsing is currently disabled. Please paste your resume text instead.');
  }
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
    if (lowerJD.includes(skill.toLowerCase())) foundSkills.push(skill);
  });
  return foundSkills.slice(0, 10);
};

export const formatResumeText = (text) => {
  if (!text) return '';
  return text
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+$/gm, '')
    .replace(/\u2022/g, '•') // normalize bullet
    .trim();
};

export const generateId = () => Math.random().toString(36).substr(2, 9);

// -------------------- NEW / PATCHED CORE --------------------

/**
 * Extract resume into structured JSON format (PATCHED)
 * - Handles "PROFESSIONAL EXPERIENCE" headers
 * - Robust experience / education parsing for the provided sample
 */
export const extractResumeToJSON = (resumeText) => {
  if (!resumeText) return {};

  const resume = {
    personalInfo: {
      name: '',
      email: '',
      phone: '',
      location: '',
      linkedin: '',
      website: ''
    },
    summary: '',
    experience: [],
    education: [],
    skills: { technical: [], soft: [] },
    projects: [],
    certifications: [],
    languages: [],
    awards: [],
    volunteer: [],
    interests: []
  };

  const normalized = formatResumeText(resumeText);
  const allLines = normalized.split('\n').map(l => l.trim());

  // ---------- Contact parsing ----------
  if (allLines.length > 0) resume.personalInfo.name = allLines[0];
  if (allLines.length > 1) {
    const contactLine = allLines[1];
    // email
    const emailMatch = contactLine.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/);
    if (emailMatch) resume.personalInfo.email = emailMatch[0];
    // phone
    const phoneMatch = contactLine.match(/(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
    if (phoneMatch) resume.personalInfo.phone = phoneMatch[0];
    // linkedin / github placeholders / website
    if (/linkedin/i.test(contactLine)) resume.personalInfo.linkedin = 'LinkedIn';
    // Prefer GitHub as website if present; else Portfolio if present
    if (/github/i.test(contactLine)) {
      resume.personalInfo.website = 'GitHub';
    } else if (/portfolio/i.test(contactLine)) {
      resume.personalInfo.website = 'Portfolio';
    }
  }

  // ---------- Sectionize text ----------
  // Accept multiple variants, anchored to line start
  const HEADER_RE = /^(SUMMARY|PROFESSIONAL SUMMARY|OBJECTIVE|PROFESSIONAL EXPERIENCE|WORK EXPERIENCE|EXPERIENCE|EDUCATION|PROJECTS|TECHNICAL SKILLS|SKILLS|CERTIFICATIONS|LANGUAGES|AWARDS|VOLUNTEER|INTERESTS)\s*$/i;

  const buckets = {};
  let current = null;
  for (let i = 0; i < allLines.length; i++) {
    const line = allLines[i];
    if (HEADER_RE.test(line)) {
      current = line.toUpperCase().replace(/\s+/g, ' ');
      if (!buckets[current]) buckets[current] = [];
      continue;
    }
    if (current) {
      buckets[current].push(line);
    }
  }

  // ---------- Summary ----------
  if (buckets['SUMMARY'] && buckets['SUMMARY'].length) {
    resume.summary = buckets['SUMMARY'].join(' ').trim();
  } else if (buckets['PROFESSIONAL SUMMARY']) {
    resume.summary = buckets['PROFESSIONAL SUMMARY'].join(' ').trim();
  } else if (buckets['OBJECTIVE']) {
    resume.summary = buckets['OBJECTIVE'].join(' ').trim();
  }

  // ---------- Experience ----------
  const expLines = (buckets['PROFESSIONAL EXPERIENCE'] || buckets['WORK EXPERIENCE'] || buckets['EXPERIENCE'] || []);
  resume.experience = extractExperienceSection(expLines);

  // ---------- Education ----------
  const eduLines = buckets['EDUCATION'] || [];
  resume.education = extractEducationSection(eduLines);

  // ---------- Skills ----------
  const skillLines = (buckets['TECHNICAL SKILLS'] || buckets['SKILLS'] || []);
  const skillsObj = extractSkillsSection(skillLines);
  resume.skills.technical = skillsObj.technical;
  resume.skills.soft = skillsObj.soft;

  // ---------- Projects ----------
  const projectLines = buckets['PROJECTS'] || [];
  resume.projects = extractProjectsSection(projectLines);

  // ---------- Other simple sections ----------
  resume.certifications = extractCertificationsSection(buckets['CERTIFICATIONS'] || []);
  resume.languages = extractLanguagesSection(buckets['LANGUAGES'] || []);
  resume.awards = extractAwardsSection(buckets['AWARDS'] || []);
  resume.volunteer = extractVolunteerSection(buckets['VOLUNTEER'] || []);
  resume.interests = extractInterestsSection(buckets['INTERESTS'] || []);

  return resume;
};

/**
 * Extract experience section (PATCHED)
 * Supports:
 *   Job line: "Title | Company, City, ST"
 *   Next line: "MM/YYYY - Present" (or "MM/YYYY - MM/YYYY")
 *   Bullets: lines starting with • - *
 *   Tech stack: "Tech Stack: ..."
 */
const extractExperienceSection = (lines) => {
  const experiences = [];
  let current = null;

  const isBullet = (s) => /^[•\-\*]\s+/.test(s);
  const isDateLine = (s) => /^\d{1,2}\/\d{4}\s*[-–—]\s*(Present|\d{1,2}\/\d{4})$/i.test(s);
  const isJobHeader = (s) => s.includes('|') && !isBullet(s) && !/^tech stack:/i.test(s);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    if (isJobHeader(line)) {
      if (current) experiences.push(current);
      current = { title: '', company: '', location: '', duration: '', bullets: [], techStack: '' };

      const parts = line.split('|').map(p => p.trim());
      current.title = parts[0] || '';

      const right = parts[1] || '';
      if (right) {
        if (right.includes(',')) {
          const idx = right.indexOf(',');
          current.company = right.slice(0, idx).trim();
          current.location = right.slice(idx + 1).trim();
        } else {
          current.company = right.trim();
        }
      }

      // Peek next non-empty line for date range
      let k = i + 1;
      while (k < lines.length && !lines[k].trim()) k++;
      if (k < lines.length && isDateLine(lines[k].trim())) {
        current.duration = lines[k].trim();
        i = k; // advance past date line
      }
      continue;
    }

    if (current) {
      if (isDateLine(line)) {
        // In case the date line didn't directly follow header
        current.duration = line;
      } else if (/^tech stack:/i.test(line)) {
        current.techStack = line.replace(/^tech stack:\s*/i, '').trim();
      } else if (isBullet(line)) {
        current.bullets.push(line.replace(/^[•\-\*]\s+/, '').trim());
      } else {
        // Treat as a free-form bullet/description line
        current.bullets.push(line.trim());
      }
    }
  }

  if (current) experiences.push(current);
  return experiences;
};

/**
 * Extract education section (PATCHED)
 * Supports:
 *   "Degree, Institution, Location"
 *   followed by a date-only line "MM/YYYY"
 * If multiple degree lines are followed by multiple date lines, dates are assigned in order.
 */
const extractEducationSection = (lines) => {
  const education = [];
  const dateOnly = /^\d{1,2}\/\d{4}$/;
  const degreeLine = /^(.*?),\s*(.*?)(?:,\s*(.*))?$/; // degree, institution, [location]

  let lastIdxNeedingDate = -1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    if (degreeLine.test(line)) {
      const m = line.match(degreeLine);
      const degree = (m[1] || '').trim();
      const institution = (m[2] || '').trim();
      const location = (m[3] || '').trim();
      education.push({ degree, institution, duration: '', gpa: '', location });
      lastIdxNeedingDate = education.length - 1;
      continue;
    }

    if (dateOnly.test(line)) {
      // Assign to the earliest entry without a duration
      const idx = education.findIndex(e => !e.duration);
      if (idx !== -1) {
        education[idx].duration = line;
      } else if (lastIdxNeedingDate >= 0) {
        education[lastIdxNeedingDate].duration = line;
      }
      continue;
    }

    // GPA parsing if present
    if (/gpa/i.test(line) && education.length) {
      education[education.length - 1].gpa = line.trim();
    }
  }

  return education;
};

// -------------------- Original helpers kept as-is --------------------

const extractSkillsSection = (lines) => {
  const skills = { technical: [], soft: [] };
  const technicalKeywords = [
    'javascript', 'python', 'java', 'react', 'node.js', 'sql', 'aws', 'docker',
    'kubernetes', 'git', 'html', 'css', 'typescript', 'angular', 'vue.js',
    'mongodb', 'postgresql', 'redis', 'kafka', 'microservices', 'ci/cd',
    'jenkins', 'terraform', 'ansible', 'linux', 'machine learning', 'data analysis',
    'c++', 'c#', 'rust', 'graphql', 'nosql', 'mysql', 'mongodb',
    'html5', 'json', 'adobe flex', 'restful apis', 'agile', 'scrum', 'jira',
    'confluence', 'visual studio code', 'github',
    'amazon aws', 'google gcp', 'microsoft azure', 'next.js', 'vercel', 'firebase',
    'express.js', 'mern', 'paypal', 'stripe', 'ec3', 'web3', 'blockchain',
    'websockets', 'jwt', 'oauth2', 'mockito', 'junit', 'dynamodb', 'redis'
  ];

  lines.forEach(line => {
    const trimmed = line.trim();
    if (!trimmed) return;
    if (/:$/.test(trimmed.toLowerCase()) || trimmed.includes(':')) {
      // category header line; skip values on header line
      return;
    }
    const parts = trimmed.split(/[,;]\s*/).map(s => s.trim()).filter(Boolean);
    parts.forEach(skill => {
      const lower = skill.toLowerCase();
      if (technicalKeywords.some(k => lower.includes(k))) {
        skills.technical.push(skill);
      } else {
        skills.soft.push(skill);
      }
    });
  });

  skills.technical = [...new Set(skills.technical)];
  skills.soft = [...new Set(skills.soft)];
  return skills;
};

const extractProjectsSection = (lines) => {
  const projects = [];
  let current = null;

  const isBullet = (s) => /^[•\-\*]\s+/.test(s);

  lines.forEach(line => {
    const trimmed = line.trim();
    if (!trimmed) return;

    if (trimmed.includes('|') && !isBullet(trimmed)) {
      if (current) projects.push(current);
      const parts = trimmed.split('|').map(p => p.trim());
      current = { name: parts[0] || '', techStack: parts[1] || '', bullets: [] };
    } else if (isBullet(trimmed)) {
      if (current) current.bullets.push(trimmed.replace(/^[•\-\*]\s+/, '').trim());
    } else if (current) {
      current.bullets.push(trimmed);
    }
  });

  if (current) projects.push(current);
  return projects;
};

const extractCertificationsSection = (lines) => (
  lines.map(line => line.replace(/^[•\-\*]\s*/, '').trim()).filter(Boolean)
);
const extractLanguagesSection = (lines) => (
  lines.map(line => line.replace(/^[•\-\*]\s*/, '').trim()).filter(Boolean)
);
const extractAwardsSection = (lines) => (
  lines.map(line => line.replace(/^[•\-\*]\s*/, '').trim()).filter(Boolean)
);
const extractVolunteerSection = (lines) => (
  lines.map(line => line.replace(/^[•\-\*]\s*/, '').trim()).filter(Boolean)
);
const extractInterestsSection = (lines) => (
  lines.map(line => line.replace(/^[•\-\*]\s*/, '').trim()).filter(Boolean)
);

// -------------------- Kept utilities --------------------

export const extractBulletPoints = (resumeText) => {
  if (!resumeText) return [];
  const bulletPatterns = [
    /^[•\-\*]\s*(.+)$/gm,
    /^[A-Z]\.\s*(.+)$/gm,
    /^[0-9]+\.\s*(.+)$/gm,
    /^[a-z]\)\s*(.+)$/gm,
    /^[A-Z]\)\s*(.+)$/gm,
    /\s+[•\-\*]\s*(.+)$/gm,
    /\s+[A-Z]\.\s*(.+)$/gm,
    /\s+[0-9]+\.\s*(.+)$/gm,
    /\s+[a-z]\)\s*(.+)$/gm,
    /\s+[A-Z]\)\s*(.+)$/gm,
  ];

  const bullets = [];
  let id = 1;

  bulletPatterns.forEach(pattern => {
    const matches = resumeText.match(pattern);
    if (matches) {
      matches.forEach(match => {
        const textMatch = match.match(pattern);
        if (textMatch && textMatch[1]) {
          const text = textMatch[1].trim();
          if (text && text.length > 10) {
            bullets.push({
              id: `original-${id++}`,
              text,
              isEnabled: true,
              type: 'original'
            });
          }
        }
      });
    }
  });

  if (bullets.length === 0) {
    const sections = resumeText.split(/(?=^(?:EDUCATION|EXPERIENCE|SKILLS|PROJECTS|ACHIEVEMENTS|SUMMARY|OBJECTIVE|WORK HISTORY|EMPLOYMENT|TECHNICAL SKILLS|SOFT SKILLS|LANGUAGES|CERTIFICATIONS|AWARDS|VOLUNTEER|INTERESTS|REFERENCES))/im);
    sections.forEach((section, sIdx) => {
      const sentences = section.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 10);
      sentences.forEach((sentence, sentIdx) => {
        const cleanText = sentence.trim();
        if (cleanText && cleanText.length > 10) {
          bullets.push({
            id: `original-${sIdx}-${sentIdx}`,
            text: cleanText,
            isEnabled: true,
            type: 'original'
          });
        }
      });
    });
    if (bullets.length === 0) {
      const cleanText = resumeText.trim();
      if (cleanText && cleanText.length > 10) {
        bullets.push({ id: 'original-1', text: cleanText, isEnabled: true, type: 'original' });
      }
    }
  }
  return bullets;
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

export const resumeJSONToText = (resumeData) => {
  if (!resumeData) return '';
  let text = '';

  if (resumeData.personalInfo) {
    const { name, email, phone, location, linkedin, website } = resumeData.personalInfo;
    if (name) text += `${name}\n`;
    const contactParts = [phone, email, location, linkedin, website].filter(Boolean);
    if (contactParts.length) text += contactParts.join(' • ') + '\n\n';
  }

  if (resumeData.summary) text += `SUMMARY\n${resumeData.summary}\n\n`;

  if (resumeData.experience?.length) {
    text += 'PROFESSIONAL EXPERIENCE\n';
    resumeData.experience.forEach(exp => {
      const headerRight = [exp.company, exp.location].filter(Boolean).join(', ');
      text += `${exp.title} | ${headerRight}\n`;
      if (exp.duration) text += `${exp.duration}\n`;
      exp.bullets?.forEach(b => text += `• ${b}\n`);
      if (exp.techStack) text += `Tech Stack: ${exp.techStack}\n`;
      text += '\n';
    });
  }

  if (resumeData.skills) {
    const { technical, soft } = resumeData.skills;
    if (technical?.length) text += 'TECHNICAL SKILLS\n' + technical.join(', ') + '\n\n';
    if (soft?.length) text += 'SOFT SKILLS\n' + soft.join(', ') + '\n\n';
  }

  if (resumeData.projects?.length) {
    text += 'PROJECTS\n';
    resumeData.projects.forEach(p => {
      text += `${p.name}${p.techStack ? ' | ' + p.techStack : ''}\n`;
      p.bullets?.forEach(b => text += `• ${b}\n`);
      text += '\n';
    });
  }

  if (resumeData.education?.length) {
    text += 'EDUCATION\n';
    resumeData.education.forEach(e => {
      const right = [e.institution, e.location].filter(Boolean).join(', ');
      text += `${e.degree}${right ? ' - ' + right : ''}${e.duration ? ' - ' + e.duration : ''}\n`;
      if (e.gpa) text += `${e.gpa}\n`;
      text += '\n';
    });
  }

  ['certifications','languages','awards','volunteer','interests'].forEach(key => {
    const arr = resumeData[key];
    if (Array.isArray(arr) && arr.length) {
      const header = key.toUpperCase();
      text += `${header}\n`;
      if (key === 'languages' || key === 'interests') {
        text += arr.join(', ') + '\n\n';
      } else {
        arr.forEach(item => text += `• ${item}\n`);
        text += '\n';
      }
    }
  });

  return text.trim();
};

export const generateResumeContent = (data) => {
  const { originalResume, originalBullets, generatedBullets } = data;
  const enabledOriginalBullets = originalBullets?.filter(b => b.isEnabled) || [];
  const enabledGeneratedBullets = generatedBullets?.filter(b => b.isEnabled) || [];
  let updatedResume = originalResume;

  if (originalBullets?.length) {
    const lines = updatedResume.split('\n');
    const newLines = [];
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const match = enabledOriginalBullets.find(b => line.includes(b.text) || b.text.includes(line.trim()));
      if (match) newLines.push(line);
      else if (!originalBullets.find(b => line.includes(b.text))) newLines.push(line);
    }
    updatedResume = newLines.join('\n');
  }

  if (enabledGeneratedBullets.length > 0) {
    const lines = updatedResume.split('\n');
    const newLines = [];
    let inserted = false;
    for (let i = 0; i < lines.length; i++) {
      newLines.push(lines[i]);
      if (!inserted && /^(\s*)?(EXPERIENCE|PROFESSIONAL EXPERIENCE|WORK EXPERIENCE)/i.test(lines[i])) {
        const bulletLines = enabledGeneratedBullets.map(b => `• ${b.text}`);
        newLines.push('', 'Generated Bullets:', '', ...bulletLines, '');
        inserted = true;
      }
    }
    updatedResume = newLines.join('\n');
  }

  return updatedResume;
};

export const generateResumePreview = (data) => {
  const { originalResume, originalBullets, generatedBullets } = data;
  const enabledOriginalBullets = originalBullets?.filter(b => b.isEnabled) || [];
  const enabledGeneratedBullets = generatedBullets?.filter(b => b.isEnabled) || [];
  let preview = '';

  preview += 'PROFESSIONAL RESUME\n' + '='.repeat(50) + '\n\n';
  if (originalResume) {
    const truncated = originalResume.length > 200 ? originalResume.slice(0, 200) + '...' : originalResume;
    preview += truncated + '\n\n';
  }
  if (enabledOriginalBullets.length || enabledGeneratedBullets.length) {
    preview += 'SELECTED BULLETS\n' + '-'.repeat(30) + '\n';
    if (enabledOriginalBullets.length) {
      preview += 'Original Bullets (Enabled):\n';
      enabledOriginalBullets.forEach(b => preview += `• ${b.text}\n`);
      preview += '\n';
    }
    if (enabledGeneratedBullets.length) {
      preview += 'Generated Bullets (Will appear in Work Experience):\n';
      enabledGeneratedBullets.forEach(b => preview += `• ${b.text}\n`);
      preview += '\n';
    }
  }
  return preview;
};


import React from 'react';

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

/**
 * Generate cover letter PDF using React-PDF
 */
export const generateCoverLetterPDF = async (coverLetterText) => {
  try {
    console.log('Starting cover letter PDF generation...');
    
    // Dynamic imports to avoid caching issues
    const { pdf, Document, Page, Text, StyleSheet } = await import('@react-pdf/renderer');
    console.log('React-PDF imported successfully for cover letter');
    
    const styles = StyleSheet.create({
      page: {
        padding: 40,
        fontSize: 12,
        lineHeight: 1.5,
        fontFamily: 'Helvetica',
      },
      paragraph: {
        marginBottom: 15,
        textAlign: 'justify',
      }
    });

    // Split the cover letter into paragraphs
    const paragraphs = coverLetterText.split('\n\n').filter(p => p.trim());
    
    const CoverLetterDocument = () => (
      <Document>
        <Page size="A4" style={styles.page}>
          {paragraphs.map((paragraph, index) => (
            <Text key={index} style={styles.paragraph}>
              {paragraph.trim()}
            </Text>
          ))}
        </Page>
      </Document>
    );

    const pdfBlob = await pdf(CoverLetterDocument()).toBlob();
    console.log('Cover letter PDF generated successfully');
    return pdfBlob;
    
  } catch (error) {
    console.error('Error generating cover letter PDF:', error);
    throw error;
  }
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

import { v4 as uuidv4 } from 'uuid';

// UUID-based ID generation to ensure global uniqueness
export const generateId = () => uuidv4();

// -------------------- NEW / PATCHED CORE --------------------

/**
 * Extract resume into structured JSON format (UPDATED for new canonical schema)
 * Returns the new canonical JSON schema with proper structure
 */
export const extractResumeToJSON = (resumeText) => {
  if (!resumeText) return {};

  const resume = {
    metadata: {
      name: '',
      contact: {
        phone: '',
        email: '',
        links: []
      },
      summary: ''
    },
    sections: []
  };

  const normalized = formatResumeText(resumeText);
  const allLines = normalized.split('\n').map(l => l.trim());

  // ---------- Contact parsing ----------
  if (allLines.length > 0) resume.metadata.name = allLines[0];
  if (allLines.length > 1) {
    const contactLine = allLines[1];
    // email
    const emailMatch = contactLine.match(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/);
    if (emailMatch) resume.metadata.contact.email = emailMatch[0];
    // phone
    const phoneMatch = contactLine.match(/(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
    if (phoneMatch) resume.metadata.contact.phone = phoneMatch[0];
    // linkedin / github placeholders
    if (/linkedin/i.test(contactLine)) resume.metadata.contact.links.push('LinkedIn');
    if (/github/i.test(contactLine)) resume.metadata.contact.links.push('GitHub');
  }

  // ---------- Sectionize text ----------
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
    resume.metadata.summary = buckets['SUMMARY'].join(' ').trim();
  } else if (buckets['PROFESSIONAL SUMMARY']) {
    resume.metadata.summary = buckets['PROFESSIONAL SUMMARY'].join(' ').trim();
  } else if (buckets['OBJECTIVE']) {
    resume.metadata.summary = buckets['OBJECTIVE'].join(' ').trim();
  }

  // ---------- Professional Experience Section ----------
  const expLines = (buckets['PROFESSIONAL EXPERIENCE'] || buckets['WORK EXPERIENCE'] || buckets['EXPERIENCE'] || []);
  if (expLines.length > 0) {
    const experienceSection = {
      title: 'Professional Experience',
      entries: extractExperienceEntries(expLines)
    };
    resume.sections.push(experienceSection);
  }

  // ---------- Education Section ----------
  const eduLines = buckets['EDUCATION'] || [];
  if (eduLines.length > 0) {
    const educationSection = {
      title: 'Education',
      entries: extractEducationEntries(eduLines)
    };
    resume.sections.push(educationSection);
  }

  // ---------- Projects Section ----------
  const projectLines = buckets['PROJECTS'] || [];
  if (projectLines.length > 0) {
    const projectsSection = {
      title: 'Projects',
      entries: extractProjectEntries(projectLines)
    };
    resume.sections.push(projectsSection);
  }

  // ---------- Skills Section ----------
  const skillLines = (buckets['TECHNICAL SKILLS'] || buckets['SKILLS'] || []);
  if (skillLines.length > 0) {
    // Parse labeled skills into top-level skills object and section entries
    const labeledSkills = parseLabeledSkills(skillLines);
    if (Object.keys(labeledSkills).length > 0) {
      // Attach to top-level for API/consumers that expect it
      resume.skills = labeledSkills;
      // Also create a Skills section for the editor
      const entries = Object.keys(labeledSkills).map(category => ({
        category,
        skills: labeledSkills[category]
      }));
      resume.sections.push({ title: 'Skills', entries });
    } else {
      // Fallback to legacy classifier
      const skillsSection = {
        title: 'Skills',
        entries: extractSkillEntries(skillLines)
      };
      resume.sections.push(skillsSection);
    }
  }

  return resume;
};

/**
 * Extract experience entries with the new canonical structure
 */
const extractExperienceEntries = (lines) => {
  const entries = [];
  let current = null;

  const isBullet = (s) => /^[•\-\*]\s+/.test(s);
  const isDateLine = (s) => /^\d{1,2}\/\d{4}\s*[-–—]\s*(Present|\d{1,2}\/\d{4})$/i.test(s);
  const isJobHeader = (s) => s.includes('|') && !isBullet(s) && !/^tech stack:/i.test(s);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    if (isJobHeader(line)) {
      if (current) entries.push(current);
      current = { 
        job_title: '', 
        company: '', 
        location: '', 
        date_range: '', 
        bullets: [], 
        tech_stack: [] 
      };

      const parts = line.split('|').map(p => p.trim());
      current.job_title = parts[0] || '';

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
        current.date_range = lines[k].trim();
        i = k; // advance past date line
      }
      continue;
    }

    if (current) {
      if (isDateLine(line)) {
        // In case the date line didn't directly follow header
        current.date_range = line;
      } else if (/^tech stack:/i.test(line)) {
        const techStack = line.replace(/^tech stack:\s*/i, '').trim();
        current.tech_stack = techStack.split(/[,;]\s*/).map(s => s.trim()).filter(Boolean);
      } else if (isBullet(line)) {
        const bulletText = line.replace(/^[•\-\*]\s+/, '').trim();
        current.bullets.push({
          id: generateId(),
          text: bulletText,
          origin: 'original',
          enabled: true
        });
      } else {
        // Continuation line: append to the last bullet if present; else start a new bullet
        const continuation = line.trim();
        if (continuation) {
          if (current.bullets.length > 0) {
            const last = current.bullets[current.bullets.length - 1];
            last.text = `${last.text} ${continuation}`.replace(/\s+/g, ' ').trim();
          } else {
            current.bullets.push({
              id: generateId(),
              text: continuation,
              origin: 'original',
              enabled: true
            });
          }
        }
      }
    }
  }

  if (current) entries.push(current);
  return entries;
};

/**
 * Extract education entries with the new canonical structure
 */
const extractEducationEntries = (lines) => {
  const entries = [];
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
      
      entries.push({ 
        degree, 
        institution, 
        location, 
        date: '' 
      });
      lastIdxNeedingDate = entries.length - 1;
      continue;
    }

    if (dateOnly.test(line)) {
      // Assign to the earliest entry without a date
      const idx = entries.findIndex(e => !e.date);
      if (idx !== -1) {
        entries[idx].date = line;
      } else if (lastIdxNeedingDate >= 0) {
        entries[lastIdxNeedingDate].date = line;
      }
      continue;
    }
  }

  return entries;
};

// -------------------- Original helpers kept as-is --------------------

/**
 * Extract project entries with the new canonical structure
 */
const extractProjectEntries = (lines) => {
  const entries = [];
  let current = null;

  const isBullet = (s) => /^[•\-\*]\s+/.test(s);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    if (line.includes('|') && !isBullet(line)) {
      if (current) entries.push(current);
      const parts = line.split('|').map(p => p.trim());
      current = { 
        name: parts[0] || '', 
        tech_stack: parts[1] ? parts[1].split(/[,;]\s*/).map(s => s.trim()).filter(Boolean) : [], 
        bullets: [] 
      };
    } else if (isBullet(line)) {
      if (current) {
        const bulletText = line.replace(/^[•\-\*]\s+/, '').trim();
        current.bullets.push({
          id: generateId(),
          text: bulletText,
          origin: 'original',
          enabled: true
        });
      }
    } else if (current) {
      // Continuation line: append to the last bullet if present; else start a new bullet
      const continuation = line.trim();
      if (continuation) {
        if (current.bullets.length > 0) {
          const last = current.bullets[current.bullets.length - 1];
          last.text = `${last.text} ${continuation}`.replace(/\s+/g, ' ').trim();
        } else {
          current.bullets.push({
            id: generateId(),
            text: continuation,
            origin: 'original',
            enabled: true
          });
        }
      }
    }
  }

  if (current) entries.push(current);
  return entries;
};

/**
 * Extract skill entries with the new canonical structure
 */
const extractSkillEntries = (lines) => {
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

  const technicalSkills = [];
  const softSkills = [];

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
        technicalSkills.push(skill);
      } else {
        softSkills.push(skill);
      }
    });
  });

  const entries = [];
  
  if (technicalSkills.length > 0) {
    entries.push({
      category: 'Technical Skills',
      skills: [...new Set(technicalSkills)]
    });
  }
  
  if (softSkills.length > 0) {
    entries.push({
      category: 'Soft Skills',
      skills: [...new Set(softSkills)]
    });
  }

  return entries;
};

/**
 * Parse labeled skills blocks like:
 * Programming Languages:
 * Frontend Technologies:
 * ...
 * Java, Python, ...
 * React, Angular, ...
 *
 * Supports both "Header: value, value" on same line and header followed by values on next line(s).
 */
const parseLabeledSkills = (lines) => {
  const categories = new Map();
  const KNOWN_HEADERS = [
    'Programming Languages',
    'Frontend Technologies',
    'Database Management',
    'Backend Technologies',
    'Tools & Methodologies',
    'Development Tools',
    'Version Control & Cloud'
  ];

  // Header aliases/normalization
  const HEADER_ALIASES = new Map([
    ['programming languages', 'Programming Languages'],
    ['languages (programming)', 'Programming Languages'],
    ['coding languages', 'Programming Languages'],
    ['frontend technologies', 'Frontend Technologies'],
    ['front-end technologies', 'Frontend Technologies'],
    ['frontend', 'Frontend Technologies'],
    ['front-end', 'Frontend Technologies'],
    ['ui technologies', 'Frontend Technologies'],
    ['database management', 'Database Management'],
    ['databases', 'Database Management'],
    ['dbms', 'Database Management'],
    ['backend technologies', 'Backend Technologies'],
    ['back-end technologies', 'Backend Technologies'],
    ['backend', 'Backend Technologies'],
    ['back-end', 'Backend Technologies'],
    ['tools & methodologies', 'Tools & Methodologies'],
    ['tools and methodologies', 'Tools & Methodologies'],
    ['methodologies', 'Tools & Methodologies'],
    ['development tools', 'Development Tools'],
    ['dev tools', 'Development Tools'],
    ['version control & cloud', 'Version Control & Cloud'],
    ['version control and cloud', 'Version Control & Cloud'],
    ['cloud & version control', 'Version Control & Cloud'],
    ['cloud and version control', 'Version Control & Cloud'],
  ]);

  const normalizeHeader = (h) => {
    if (!h) return null;
    const key = h.toLowerCase().trim();
    if (HEADER_ALIASES.has(key)) return HEADER_ALIASES.get(key);
    const direct = KNOWN_HEADERS.find(k => k.toLowerCase() === key);
    return direct || null;
  };

  const isHeaderOnly = (line) => {
    // Accept patterns like: "Header:", "Header -", "Header —", "Header –"
    const m = line.match(/^(.+?)[:\-–—]\s*$/);
    if (!m) return null;
    const canon = normalizeHeader(m[1]);
    return canon;
  };

  const addValues = (header, values) => {
    if (!header || !values || values.length === 0) return;
    const existing = categories.get(header) || [];
    const merged = [...existing, ...values]
      .map(s => s.trim())
      .filter(Boolean);
    categories.set(header, Array.from(new Set(merged)));
  };

  // First, handle inline pattern: "Header: a, b, c" lines anywhere
  const remaining = [];
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    // Normalize bullets/dashes from list items
    const clean = line.replace(/^([•\-\*\u2022]+)\s*/, '');
    const m = clean.match(/^(.+?)[:\-–—]\s*(.+)$/);
    const canonHeader = m ? normalizeHeader(m[1]) : null;
    if (m && canonHeader) {
      const values = m[2]
        .split(/[,;|/·•]\s*/)
        .map(s => s.replace(/^([•\-\*\u2022]+)\s*/, '').trim())
        .filter(Boolean);
      const header = canonHeader;
      addValues(header, values);
    } else {
      remaining.push(clean);
    }
  }

  // Next, handle block pattern: multiple headers first, then same-count value lines
  let i = 0;
  while (i < remaining.length) {
    // collect consecutive headers
    const headers = [];
    while (i < remaining.length) {
      const h = isHeaderOnly(remaining[i]);
      if (!h) break;
      headers.push(h);
      i++;
    }
    if (headers.length === 0) {
      i++; // skip stray non-header line
      continue;
    }
    // collect following non-empty value lines (up to headers.length)
    const valuesLines = [];
    while (i < remaining.length && valuesLines.length < headers.length) {
      const maybeHeader = isHeaderOnly(remaining[i]);
      if (maybeHeader) break; // stop if a new header-only block starts
      if (remaining[i]) valuesLines.push(remaining[i]);
      i++;
    }
    // Map one-to-one
    const count = Math.min(headers.length, valuesLines.length);
    for (let k = 0; k < count; k++) {
      const values = valuesLines[k]
        .split(/[,;|/·•]\s*/)
        .map(s => s.replace(/^([•\-\*\u2022]+)\s*/, '').trim())
        .filter(Boolean);
      addValues(headers[k], values);
    }
  }

  // Convert to plain object
  const result = {};
  for (const [k, v] of categories.entries()) {
    if (v && v.length) result[k] = v;
  }
  // If nothing matched but there are comma-separated lines under SKILLS, put them under Other Skills
  if (Object.keys(result).length === 0) {
    const flat = lines
      .map(l => l.trim())
      .filter(Boolean)
      .map(l => l.replace(/^([•\-\*\u2022]+)\s*/, ''))
      .flatMap(l => l.split(/[,;|/·•]\s*/))
      .map(s => s.trim())
      .filter(Boolean);
    if (flat.length) {
      result['Other Skills'] = Array.from(new Set(flat));
    }
  }
  return result;
};



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

  bulletPatterns.forEach(pattern => {
    const matches = resumeText.match(pattern);
    if (matches) {
      matches.forEach(match => {
        const textMatch = match.match(pattern);
        if (textMatch && textMatch[1]) {
          const text = textMatch[1].trim();
          if (text && text.length > 10) {
            bullets.push({
              id: generateId(),
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
            id: generateId(),
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
        bullets.push({ id: generateId(), text: cleanText, isEnabled: true, type: 'original' });
      }
    }
  }
  return bullets;
};





/**
 * Convert resume JSON to PDF using React-PDF
 */
export const convertResumeToPDF = async (resumeJSON) => {
  try {
    console.log('Starting PDF generation with resume data:', resumeJSON);
    
    // Dynamic imports to avoid caching issues
    const { pdf } = await import('@react-pdf/renderer');
    console.log('React-PDF imported successfully');
    
    const { ResumeTemplate } = await import('../components/ResumeTemplate.js');
    console.log('ResumeTemplate imported successfully');
    
    // Add a timestamp to force re-render and avoid caching
    const timestamp = Date.now();
    console.log(`Generating PDF at ${timestamp} with updated template`);
    
    // Validate resume data - support both old and new schema formats
    if (!resumeJSON) {
      throw new Error('Invalid resume data: no resume data provided');
    }
    
    // Check for new schema format (experience, education, etc.) or old schema format (sections)
    const hasNewSchema = resumeJSON.experience || resumeJSON.education || resumeJSON.technical_skills;
    const hasOldSchema = resumeJSON.sections;
    
    if (!hasNewSchema && !hasOldSchema) {
      throw new Error('Invalid resume data: missing experience/education data or sections');
    }
    
    // Validate resume data before passing to component
    console.log('Resume data being passed to PDF template:', {
      hasName: !!resumeJSON.name,
      hasExperience: !!resumeJSON.experience,
      hasSections: !!resumeJSON.sections,
      experienceLength: resumeJSON.experience?.length || 0,
      sectionsLength: resumeJSON.sections?.length || 0
    });
    
    // Create a simple React element without complex props
    const resumeElement = React.createElement(ResumeTemplate, { resume: resumeJSON });
    
    // Add a key prop to force React to re-render the component
    const blob = await pdf(resumeElement).toBlob();
    console.log('PDF blob generated successfully, size:', blob.size);
    
    return blob;
  } catch (error) {
    console.error('Detailed error in PDF generation:', error);
    console.error('Error stack:', error.stack);
    throw new Error(`PDF generation failed: ${error.message}`);
  }
};

/**
 * Download PDF file
 */
export const downloadPDF = async (resumeJSON, filename = 'resume.pdf') => {
  try {
    // Clear any cached modules and force template reload
    if (typeof window !== 'undefined') {
      const timestamp = Date.now();
      console.log(`Downloading PDF at ${timestamp} - forcing template reload`);
      
      // Clear any cached modules in development
      if (process.env.NODE_ENV === 'development') {
        // Force browser to reload the template by clearing any cached imports
        console.log('Development mode: Clearing module cache');
      }
    }
    
    const pdfBlob = await convertResumeToPDF(resumeJSON);
    downloadFile(pdfBlob, filename, 'application/pdf');
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};

/**
 * Get filtered JSON (only enabled bullets)
 */
export const getFilteredJSON = (resumeJSON) => {
  if (!resumeJSON) {
    return resumeJSON;
  }

  // Handle new schema format
  if (resumeJSON.experience) {
    const filtered = {
      ...resumeJSON,
      experience: resumeJSON.experience.map(job => ({
        ...job,
        responsibilities: job.responsibilities ? job.responsibilities.filter(resp => {
          // Handle both string and object formats
          if (typeof resp === 'string') {
            return true; // Keep all string format bullets (they're enabled by default)
          }
          return resp.enabled !== false; // Keep bullets that are not explicitly disabled
        }) : []
      }))
    };
    return filtered;
  }

  // Handle old schema format
  if (resumeJSON.sections) {
    const filtered = {
      ...resumeJSON,
      sections: resumeJSON.sections.map(section => ({
        ...section,
        entries: section.entries.map(entry => ({
          ...entry,
          bullets: entry.bullets ? entry.bullets.filter(bullet => bullet.enabled) : []
        }))
      }))
    };
    return filtered;
  }

  return resumeJSON;
};

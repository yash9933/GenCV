/**
 * Utility functions for the AI Resume Builder
 */

/**
 * Parse PDF file to text using PDF.js
 * @param {File} file - PDF file
 * @returns {Promise<string>} - Extracted text
 */
export const parsePDF = async (file) => {
  try {
    // For now, let's provide a simple fallback message
    // In a production app, you might want to use a different PDF parsing library
    // or implement server-side PDF parsing
    console.log('PDF upload attempted, but PDF parsing is currently disabled due to browser restrictions.');
    console.log('Please paste your resume text instead.');
    
    throw new Error('PDF parsing is currently disabled. Please paste your resume text instead.');
    
    // TODO: Implement proper PDF parsing with a different approach
    // Options:
    // 1. Use a different PDF library that doesn't require workers
    // 2. Implement server-side PDF parsing
    // 3. Use a PDF parsing service
    
  } catch (error) {
    console.error('Error parsing PDF:', error);
    throw new Error('PDF parsing is currently disabled. Please paste your resume text instead.');
  }
};

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 */
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Error copying to clipboard:', error);
    return false;
  }
};

/**
 * Download text as file
 * @param {string} content - File content
 * @param {string} filename - File name
 * @param {string} mimeType - MIME type
 */
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
 * Extract skills from job description
 * @param {string} jobDescription - Job description text
 * @returns {string[]} - Array of skills
 */
export const extractSkillsFromJD = (jobDescription) => {
  // This is a simple extraction - in production, you might want to use NLP
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

  return foundSkills.slice(0, 10); // Limit to 10 skills
};

/**
 * Format resume text for display
 * @param {string} text - Raw resume text
 * @returns {string} - Formatted text
 */
export const formatResumeText = (text) => {
  if (!text) return '';
  
  // Basic formatting - replace multiple spaces and newlines
  return text
    .replace(/\s+/g, ' ')
    .replace(/\n\s*\n/g, '\n\n')
    .trim();
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
  
  // Split by common bullet point indicators
  const bulletPatterns = [
    /^[•\-\*]\s*(.+)$/gm,  // • - *
    /^[A-Z]\.\s*(.+)$/gm,  // A. B. C.
    /^[0-9]+\.\s*(.+)$/gm, // 1. 2. 3.
    /^[a-z]\)\s*(.+)$/gm,  // a) b) c)
    /^[A-Z]\)\s*(.+)$/gm,  // A) B) C)
  ];
  
  const bullets = [];
  let id = 1;
  
  bulletPatterns.forEach(pattern => {
    const matches = resumeText.match(pattern);
    if (matches) {
      matches.forEach(match => {
        const text = match.replace(/^[•\-\*A-Z0-9\.\)\s]+/, '').trim();
        if (text && text.length > 10) { // Only include substantial bullets
          bullets.push({
            id: `original-${id++}`,
            text: text,
            isEnabled: true, // Original bullets are enabled by default
            type: 'original'
          });
        }
      });
    }
  });
  
  // If no bullets found with patterns, split by lines and treat as bullets
  if (bullets.length === 0) {
    const lines = resumeText.split('\n').filter(line => line.trim().length > 10);
    lines.forEach((line, index) => {
      bullets.push({
        id: `original-${index + 1}`,
        text: line.trim(),
        isEnabled: true,
        type: 'original'
      });
    });
  }
  
  return bullets;
};

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} - Debounced function
 */
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


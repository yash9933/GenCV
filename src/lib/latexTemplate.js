/**
 * LaTeX Template Module
 * Contains the LaTeX template and formatting functions
 * This file can be easily modified to change the resume template
 */

/**
 * Escape LaTeX special characters
 */
const escapeLaTeX = (text) => {
  if (!text) return '';
  return text
    .replace(/\\/g, '\\textbackslash{}')
    .replace(/[&%$#_{}~^]/g, '\\$&')
    .replace(/</g, '\\textless{}')
    .replace(/>/g, '\\textgreater{}');
};

/**
 * Generate LaTeX header with packages and settings
 */
const generateLaTeXHeader = (resumeJSON) => {
  return `\\documentclass[10pt, letterpaper]{article}

% Packages:
\\usepackage[
    ignoreheadfoot, % set margins without considering header and footer
    top=2 cm, % seperation between body and page edge from the top
    bottom=2 cm, % seperation between body and page edge from the bottom
    left=2 cm, % seperation between body and page edge from the left
    right=2 cm, % seperation between body and page edge from the right
    footskip=1.0 cm, % seperation between body and footer
    % showframe % for debugging 
]{geometry} % for adjusting page geometry
\\usepackage{titlesec} % for customizing section titles
\\usepackage{tabularx} % for making tables with fixed width columns
\\usepackage{array} % tabularx requires this
\\usepackage[dvipsnames]{xcolor} % for coloring text
\\definecolor{primaryColor}{RGB}{0, 0, 0} % define primary color
\\usepackage{enumitem} % for customizing lists
\\usepackage{fontawesome5} % for using icons
\\usepackage{amsmath} % for math
\\usepackage[
    pdftitle={${escapeLaTeX(resumeJSON.metadata?.name || 'Resume')}'s CV},
    pdfauthor={${escapeLaTeX(resumeJSON.metadata?.name || 'Resume')}},
    pdfcreator={LaTeX with Resume Builder},
    colorlinks=true,
    urlcolor=primaryColor
]{hyperref} % for links, metadata and bookmarks
\\usepackage[pscoord]{eso-pic} % for floating text on the page
\\usepackage{calc} % for calculating lengths
\\usepackage{bookmark} % for bookmarks
\\usepackage{lastpage} % for getting the total number of pages
\\usepackage{changepage} % for one column entries (adjustwidth environment)
\\usepackage{paracol} % for two and three column entries
\\usepackage{ifthen} % for conditional statements
\\usepackage{needspace} % for avoiding page brake right after the section title
\\usepackage{iftex} % check if engine is pdflatex, xetex or luatex

% Ensure that generate pdf is machine readable/ATS parsable:
\\ifPDFTeX
    \\input{glyphtounicode}
    \\pdfgentounicode=1
    \\usepackage[T1]{fontenc}
    \\usepackage[utf8]{inputenc}
    \\usepackage{lmodern}
\\fi

\\usepackage{charter}

% Some settings:
\\raggedright
\\AtBeginEnvironment{adjustwidth}{\\partopsep0pt} % remove space before adjustwidth environment
\\pagestyle{empty} % no header or footer
\\setcounter{secnumdepth}{0} % no section numbering
\\setlength{\\parindent}{0pt} % no indentation
\\setlength{\\topskip}{0pt} % no top skip
\\setlength{\\columnsep}{0.15cm} % set column seperation
\\pagenumbering{gobble} % no page numbering

\\titleformat{\\section}{\\needspace{4\\baselineskip}\\bfseries\\large}{}{0pt}{}[\\vspace{1pt}\\titlerule]

\\titlespacing{\\section}{
    % left space:
    -1pt
}{
    % top space:
    0.4 cm
}{
    % bottom space:
    0.2 cm
} % section title spacing

\\renewcommand\\labelitemi{$\\vcenter{\\hbox{\\small$\\bullet$}}$} % custom bullet points
\\newenvironment{highlights}{
    \\begin{itemize}[
        topsep=0.10 cm,
        parsep=0.10 cm,
        partopsep=0pt,
        itemsep=0pt,
        leftmargin=0 cm + 10pt
    ]
}{
    \\end{itemize}
} % new environment for highlights

\\newenvironment{highlightsforbulletentries}{
    \\begin{itemize}[
        topsep=0.10 cm,
        parsep=0.10 cm,
        partopsep=0pt,
        itemsep=0pt,
        leftmargin=10pt
    ]
}{
    \\end{itemize}
} % new environment for highlights for bullet entries

\\newenvironment{onecolentry}{
    \\begin{adjustwidth}{
        0 cm + 0.00001 cm
    }{
        0 cm + 0.00001 cm
    }
}{
    \\end{adjustwidth}
} % new environment for one column entries

\\newenvironment{twocolentry}[2][]{
    \\onecolentry
    \\def\\secondColumn{#2}
    \\setcolumnwidth{\\fill, 4.5 cm}
    \\begin{paracol}{2}
}{
    \\switchcolumn \\raggedleft \\secondColumn
    \\end{paracol}
    \\endonecolentry
} % new environment for two column entries

\\newenvironment{threecolentry}[3][]{
    \\onecolentry
    \\def\\thirdColumn{#3}
    \\setcolumnwidth{, \\fill, 4.5 cm}
    \\begin{paracol}{3}
    {\\raggedright #2} \\switchcolumn
}{
    \\switchcolumn \\raggedleft \\thirdColumn
    \\end{paracol}
    \\endonecolentry
} % new environment for three column entries

\\newenvironment{header}{
    \\setlength{\\topsep}{0pt}\\par\\kern\\topsep\\centering\\linespread{1.5}
}{
    \\par\\kern\\topsep
} % new environment for the header

% save the original href command in a new command:
\\let\\hrefWithoutArrow\\href

\\begin{document}
    \\newcommand{\\AND}{\\unskip
        \\cleaders\\copy\\ANDbox\\hskip\\wd\\ANDbox
        \\ignorespaces
    }
    \\newsavebox\\ANDbox
    \\sbox\\ANDbox{$|$}`;
};

/**
 * Generate contact information section
 */
const generateContactInfo = (contact) => {
  if (!contact) return '';
  
  const contactParts = [];
  
  if (contact.email) {
    contactParts.push(`\\kern 5.0 pt%
        \\mbox{\\hrefWithoutArrow{mailto:${escapeLaTeX(contact.email)}}{${escapeLaTeX(contact.email)}}}`);
  }
  
  if (contact.phone) {
    contactParts.push(`\\kern 5.0 pt%
        \\mbox{\\hrefWithoutArrow{tel:${escapeLaTeX(contact.phone)}}{${escapeLaTeX(contact.phone)}}}`);
  }
  
  if (contact.links && contact.links.length > 0) {
    contact.links.forEach(link => {
      if (link.toLowerCase().includes('linkedin')) {
        contactParts.push(`\\kern 5.0 pt%
        \\mbox{\\hrefWithoutArrow{https://linkedin.com/in/yourusername}{${escapeLaTeX(link)}}}`);
      } else if (link.toLowerCase().includes('github')) {
        contactParts.push(`\\kern 5.0 pt%
        \\mbox{\\hrefWithoutArrow{https://github.com/yourusername}{${escapeLaTeX(link)}}}`);
      } else {
        contactParts.push(`\\kern 5.0 pt%
        \\mbox{\\hrefWithoutArrow{https://yourwebsite.com/}{${escapeLaTeX(link)}}}`);
      }
    });
  }

  return contactParts.join(`
        \\AND%`);
};

/**
 * Generate header section with name and contact info
 */
const generateHeader = (resumeJSON) => {
  const contactInfo = generateContactInfo(resumeJSON.metadata?.contact);
  
  return `    \\begin{header}
        \\fontsize{25 pt}{25 pt}\\selectfont ${escapeLaTeX(resumeJSON.metadata?.name || 'Your Name')}

        \\vspace{5 pt}

        \\normalsize${contactInfo ? `
        ${contactInfo}` : ''}
    \\end{header}

    \\vspace{5 pt - 0.3 cm}

`;
};

/**
 * Generate summary section
 */
const generateSummary = (summary) => {
  if (!summary) return '';
  
  return `    \\section{Summary}
        
        \\begin{onecolentry}
            ${escapeLaTeX(summary)}
        \\end{onecolentry}

        \\vspace{0.2 cm}

`;
};

/**
 * Generate experience section
 */
const generateExperienceSection = (section) => {
  if (!section.entries || section.entries.length === 0) return '';
  
  let latex = `    \\section{${section.title}}

`;
  
  section.entries.forEach(entry => {
    const headerRight = [entry.company, entry.location].filter(Boolean).join(' -- ');
    latex += `        \\begin{twocolentry}{
            ${escapeLaTeX(entry.date_range || '')}
        }
            \\textbf{${escapeLaTeX(entry.job_title)}}, ${escapeLaTeX(headerRight)}\\end{twocolentry}

        \\vspace{0.10 cm}
        \\begin{onecolentry}
            \\begin{highlights}`;

    // Bullets (only enabled ones)
    if (entry.bullets && entry.bullets.length > 0) {
      const enabledBullets = entry.bullets.filter(bullet => bullet.enabled);
      enabledBullets.forEach(bullet => {
        latex += `
                \\item ${escapeLaTeX(bullet.text)}`;
      });
    }

    latex += `
            \\end{highlights}
        \\end{onecolentry}

        \\vspace{0.2 cm}

`;
  });
  
  return latex;
};

/**
 * Generate education section
 */
const generateEducationSection = (section) => {
  if (!section.entries || section.entries.length === 0) return '';
  
  let latex = `    \\section{${section.title}}

`;
  
  section.entries.forEach(entry => {
    const headerRight = [entry.institution, entry.location].filter(Boolean).join(', ');
    latex += `        \\begin{twocolentry}{
            ${escapeLaTeX(entry.date || '')}
        }
            \\textbf{${escapeLaTeX(entry.degree)}}, ${escapeLaTeX(headerRight)}\\end{twocolentry}

        \\vspace{0.10 cm}
        \\begin{onecolentry}
            \\begin{highlights}`;

    // Add GPA if available
    if (entry.gpa) {
      latex += `
                \\item GPA: ${escapeLaTeX(entry.gpa)}`;
    }

    // Add coursework if available
    if (entry.coursework) {
      latex += `
                \\item \\textbf{Coursework:} ${escapeLaTeX(entry.coursework)}`;
    }

    latex += `
            \\end{highlights}
        \\end{onecolentry}

        \\vspace{0.2 cm}

`;
  });
  
  return latex;
};

/**
 * Generate projects section
 */
const generateProjectsSection = (section) => {
  if (!section.entries || section.entries.length === 0) return '';
  
  let latex = `    \\section{${section.title}}

`;
  
  section.entries.forEach(entry => {
    const projectLink = entry.link || 'github.com/name/repo';
    latex += `        \\begin{twocolentry}{
            \\href{https://${escapeLaTeX(projectLink)}}{${escapeLaTeX(projectLink)}}
        }
            \\textbf{${escapeLaTeX(entry.name)}}\\end{twocolentry}

        \\vspace{0.10 cm}
        \\begin{onecolentry}
            \\begin{highlights}`;

    // Bullets (only enabled ones)
    if (entry.bullets && entry.bullets.length > 0) {
      const enabledBullets = entry.bullets.filter(bullet => bullet.enabled);
      enabledBullets.forEach(bullet => {
        latex += `
                \\item ${escapeLaTeX(bullet.text)}`;
      });
    }

    // Tech stack
    if (entry.tech_stack && entry.tech_stack.length > 0) {
      latex += `
                \\item Tools Used: ${escapeLaTeX(entry.tech_stack.join(', '))}`;
    }

    latex += `
            \\end{highlights}
        \\end{onecolentry}

        \\vspace{0.2 cm}

`;
  });
  
  return latex;
};

/**
 * Generate skills section
 */
const generateSkillsSection = (section) => {
  if (!section.entries || section.entries.length === 0) return '';
  
  let latex = `    \\section{${section.title}}

`;
  
  section.entries.forEach(entry => {
    if (entry.category && entry.skills && entry.skills.length > 0) {
      latex += `        \\begin{onecolentry}
            \\textbf{${escapeLaTeX(entry.category)}:} ${escapeLaTeX(entry.skills.join(', '))}
        \\end{onecolentry}

        \\vspace{0.2 cm}

`;
    }
  });
  
  return latex;
};

/**
 * Generate sections based on their type
 */
const generateSections = (sections) => {
  if (!sections || sections.length === 0) return '';
  
  let latex = '';
  
  sections.forEach(section => {
    if (section.title.toLowerCase().includes('experience')) {
      latex += generateExperienceSection(section);
    } else if (section.title.toLowerCase().includes('education')) {
      latex += generateEducationSection(section);
    } else if (section.title.toLowerCase().includes('project')) {
      latex += generateProjectsSection(section);
    } else if (section.title.toLowerCase().includes('skill')) {
      latex += generateSkillsSection(section);
    } else {
      // Default section handling
      latex += `    \\section{${section.title}}

`;
      if (section.entries && section.entries.length > 0) {
        section.entries.forEach(entry => {
          latex += `        \\begin{onecolentry}
            ${escapeLaTeX(entry.name || entry.degree || entry.job_title || 'Entry')}
        \\end{onecolentry}

        \\vspace{0.2 cm}

`;
        });
      }
    }
  });
  
  return latex;
};

/**
 * Main function to convert resume JSON to LaTeX
 */
export const jsonToLaTeX = (resumeJSON) => {
  if (!resumeJSON || !resumeJSON.sections) {
    return '';
  }

  let latex = generateLaTeXHeader(resumeJSON);
  latex += generateHeader(resumeJSON);
  latex += generateSummary(resumeJSON.metadata?.summary);
  latex += generateSections(resumeJSON.sections);
  latex += `\\end{document}`;

  return latex;
};

// Export individual functions for testing or customization
export {
  escapeLaTeX,
  generateLaTeXHeader,
  generateContactInfo,
  generateHeader,
  generateSummary,
  generateExperienceSection,
  generateEducationSection,
  generateProjectsSection,
  generateSkillsSection,
  generateSections
};

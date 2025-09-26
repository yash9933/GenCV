import React from 'react';
import { Document, Page, Text, View, StyleSheet, Link } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    paddingTop: 28,
    paddingBottom: 30,
    paddingLeft: 44,
    paddingRight: 44,
    fontSize: 11,
    fontFamily: 'Times-Roman',
    lineHeight: 1.0,
    color: '#000'
  },
  header: {
    textAlign: 'center',
    marginBottom: 8 // Slightly increased for spacing below contact line
  },
  name: {
    fontSize: 19, // Further reduced
    fontWeight: 'bold',
    marginBottom: 10, // Further reduced
    color: '#000'
  },
  contact: {
    fontSize: 10,
    color: '#000',
    lineHeight: 1.2
  },
  contactLink: {
    fontSize: 10,
    color: '#0066cc',
    textDecoration: 'underline'
  },
  section: {
    marginBottom: 6
  },
  sectionProjects: {
    marginTop: 6
  },
  sectionTitleWithRule: {
    fontSize: 11, // Reduced
    fontWeight: 'bold',
    marginBottom: 1, // Further reduced
    textTransform: 'uppercase',
    textAlign: 'center',
    color: '#000'
  },
  sectionRule: {
    borderBottom: '0.5pt solid #000',
    marginBottom: 2
  },
  entryLeft: {
    flex: 1
  },
  bullets: {
    marginLeft: 14,
    marginTop: 1
  },
  bullet: {
    fontSize: 10,
    marginBottom: 0.3,
    color: '#000',
    lineHeight: 1.1
  },
  bulletPoint: {
    fontSize: 10,
    marginBottom: 0.3,
    color: '#000',
    lineHeight: 1.1
  },
  techStack: {
    fontSize: 9,
    // fontStyle: 'italic',
    marginTop: 3,
    color: '#000'
  },
  skillsGroup: {
    marginBottom: 3
  },
  skillCategory: {
    fontWeight: 'bold',
    fontSize: 10,
    color: '#000'
  },
  skillList: {
    fontSize: 10,
    color: '#000'
  },
  certificationList: {
    fontSize: 10,
    color: '#000',
    lineHeight: 1.3
  },
  certificationItem: {
    fontSize: 10,
    color: '#000',
    lineHeight: 1.3,
    marginBottom: 2
  },
  certificationLink: {
    fontSize: 10,
    color: '#0066cc',
    textDecoration: 'underline'
  },
  summary: {
    fontSize: 10,
    lineHeight: 1.3,
    color: '#000',
    marginBottom: 4,
    textAlign: 'justify'
  },
  // Generic entry styles for all sections (experience, education, volunteer)
  entry: {
    marginBottom: 4,
    marginTop: 2
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 3
  },
  entryTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 1
  },
  entrySubtitle: {
    fontSize: 10,
    color: '#000'
  },
  entryDate: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'right'
  },
  skillCategory: {
    marginBottom: 1,
    flexDirection: 'row',
    alignItems: 'flex-start'
  },
  skillCategoryTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#000',
    marginRight: 10,
    width: 130
  },
  skills: {
    fontSize: 10,
    color: '#000',
    lineHeight: 1.2,
    flex: 1,
    textAlign: 'left'
  },
  techStack: {
    flexDirection: 'row',
    marginTop: 4,
    marginBottom: 2
  },
  techStackLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#000'
  },
  techStackList: {
    fontSize: 10,
    color: '#000',
    flex: 1
  }
});

export const ResumeTemplate = ({ resume }) => {
  // Check if resume data is available
  if (!resume) {
    console.error('ResumeTemplate: resume prop is null or undefined');
    return (
      <Document>
        <Page size="LETTER" style={styles.page}>
          <Text>Error: No resume data provided</Text>
        </Page>
      </Document>
    );
  }

  // Check if resume has any meaningful data
  const hasNewSchema = resume.experience || resume.education || resume.technical_skills;
  const hasOldSchema = resume.sections;
  const hasName = resume.name;

  if (!hasNewSchema && !hasOldSchema && !hasName) {
    console.error('ResumeTemplate: resume has no meaningful data', resume);
    return (
      <Document>
        <Page size="LETTER" style={styles.page}>
          <Text>Error: Resume data is incomplete</Text>
        </Page>
      </Document>
    );
  }

  // Helper function to get section title style
  const getSectionTitleStyle = (title) => {
    return styles.sectionTitleWithRule;
  };

  // Helper function to safely render contact info
  const renderContactInfo = () => {
    if (!resume.contact) return null;
    
    const contactElements = [];
    
    // Add phone
    if (resume.contact.phone?.trim()) {
      contactElements.push(
        <Text key="phone" style={styles.contact}>{resume.contact.phone.trim()}</Text>
      );
    }
    
    // Add email
    if (resume.contact.email?.trim()) {
      contactElements.push(
        <Text key="email" style={styles.contact}>{resume.contact.email.trim()}</Text>
      );
    }
    
    // Add LinkedIn as hyperlink
    if (resume.contact.linkedin?.trim()) {
      const linkedinUrl = resume.contact.linkedin.trim();
      // Ensure URL has protocol
      const fullLinkedinUrl = linkedinUrl.startsWith('http') ? linkedinUrl : `https://${linkedinUrl}`;
      
      contactElements.push(
        <Text key="linkedin" style={styles.contact}>
          <Link src={fullLinkedinUrl} style={styles.contactLink}>LinkedIn</Link>
        </Text>
      );
    }
    
    // Add Portfolio as hyperlink
    if (resume.contact.portfolio?.trim()) {
      const portfolioUrl = resume.contact.portfolio.trim();
      // Ensure URL has protocol
      const fullPortfolioUrl = portfolioUrl.startsWith('http') ? portfolioUrl : `https://${portfolioUrl}`;
      
      contactElements.push(
        <Text key="portfolio" style={styles.contact}>
          <Link src={fullPortfolioUrl} style={styles.contactLink}>Portfolio</Link>
        </Text>
      );
    }
    
    // Add GitHub as hyperlink
    if (resume.contact.github?.trim()) {
      const githubUrl = resume.contact.github.trim();
      // Ensure URL has protocol
      const fullGithubUrl = githubUrl.startsWith('http') ? githubUrl : `https://${githubUrl}`;
      
      contactElements.push(
        <Text key="github" style={styles.contact}>
          <Link src={fullGithubUrl} style={styles.contactLink}>GitHub</Link>
        </Text>
      );
    }
    
    if (contactElements.length === 0) return null;
    
    // Join elements with bullet separators
    const result = [];
    contactElements.forEach((element, index) => {
      if (index > 0) {
        result.push(<Text key={`separator-${index}`} style={styles.contact}> • </Text>);
      }
      result.push(element);
    });
    
    return <Text style={styles.contact}>{result}</Text>;
  };

  // Helper function to safely render responsibilities - simplified for PDF compatibility
  const renderResponsibilities = (responsibilities) => {
    if (!responsibilities || !Array.isArray(responsibilities)) return [];
    
    const validResponsibilities = [];
    
    for (let i = 0; i < responsibilities.length; i++) {
      const responsibility = responsibilities[i];
      
      // Handle both string and object formats
      let text = '';
      let isEnabled = true;
      
      if (typeof responsibility === 'string') {
        text = responsibility;
        isEnabled = true;
      } else if (responsibility && typeof responsibility === 'object') {
        text = responsibility.text || '';
        isEnabled = responsibility.enabled !== false;
      }
      
      if (isEnabled && text && text.trim() !== '') {
        validResponsibilities.push(
          <Text key={i} style={styles.bulletPoint}>
            • {text}
          </Text>
        );
      }
    }
    
    return validResponsibilities;
  };

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          {resume.name && (
            <Text style={styles.name}>{resume.name}</Text>
          )}
          {renderContactInfo()}
        </View>

        {/* Summary */}
        {resume.summary && resume.summary.trim() && (
          <View style={styles.section}>
            <Text style={styles.sectionTitleWithRule}>SUMMARY</Text>
            <View style={styles.sectionRule} />
            <Text style={styles.summary}>{resume.summary}</Text>
          </View>
        )}

        {/* Experience Section */}
        {resume.experience && resume.experience.filter(job => 
          job.title?.trim() && job.company?.trim() && job.dates?.trim()
        ).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitleWithRule}>PROFESSIONAL EXPERIENCE</Text>
            <View style={styles.sectionRule} />
            {resume.experience.filter(job => 
              job.title?.trim() && job.company?.trim() && job.dates?.trim()
            ).map((job, index) => (
              <View key={index} style={styles.entry}>
                <View style={styles.entryHeader}>
                  <View style={styles.entryLeft}>
                    <Text style={styles.entryTitle}>{job.title}</Text>
                    <Text style={styles.entrySubtitle}>
                      {job.company}{job.location && job.location.trim() ? ` — ${job.location}` : ''}
                    </Text>
                  </View>
                  <Text style={styles.entryDate}>{job.dates}</Text>
                </View>
                {job.responsibilities && job.responsibilities.length > 0 && (
                  <View style={styles.bullets}>
                    {renderResponsibilities(job.responsibilities)}
                  </View>
                )}
                {job.tech_stack && job.tech_stack.filter(tech => tech.trim() !== '').length > 0 && (
                  <View style={styles.techStack}>
                    <Text style={styles.techStackLabel}>Tech Stack: </Text>
                    <Text style={styles.techStackList}>
                      {job.tech_stack.filter(tech => tech.trim() !== '').join(', ')}
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Technical Skills Section */}
        {resume.technical_skills && Object.entries(resume.technical_skills).some(([category, skills]) => 
          Array.isArray(skills) && skills.filter(skill => skill.trim() !== '').length > 0
        ) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitleWithRule}>TECHNICAL SKILLS</Text>
            <View style={styles.sectionRule} />
            {Object.entries(resume.technical_skills).map(([category, skills]) => {
              const filteredSkills = Array.isArray(skills) ? skills.filter(skill => skill.trim() !== '') : [];
              return filteredSkills.length > 0 && (
                <View key={category} style={styles.skillCategory}>
                  <Text style={styles.skillCategoryTitle}>
                    {category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Text>
                  <Text style={styles.skills}>
                    {filteredSkills.join(', ')}
                  </Text>
                </View>
              );
            })}
          </View>
        )}

        {/* Projects Section */}
        {resume.projects && resume.projects.filter(project => 
          project.name?.trim() && (
            (project.bullets && project.bullets.filter(bullet => bullet.trim() !== '').length > 0) ||
            (project.description && project.description.trim())
          )
        ).length > 0 && (
          <View style={[styles.section, styles.sectionProjects]}>
            <Text style={styles.sectionTitleWithRule}>PROJECTS</Text>
            <View style={styles.sectionRule} />
            {resume.projects.filter(project => 
              project.name?.trim() && (
                (project.bullets && project.bullets.filter(bullet => bullet.trim() !== '').length > 0) ||
                (project.description && project.description.trim())
              )
            ).map((project, index) => (
              <View key={index} style={styles.entry}>
                <View style={styles.entryHeader}>
                  <View style={styles.entryLeft}>
                    <Text style={styles.entryTitle}>
                      {project.url && project.url.trim() ? (
                        <Link 
                          src={project.url.startsWith('http') ? project.url : `https://${project.url}`}
                          style={styles.contactLink}
                        >
                          {project.name}
                        </Link>
                      ) : (
                        project.name
                      )}
                      {project.technologies && project.technologies.filter(tech => tech.trim() !== '').length > 0 && (
                        <Text style={{fontWeight: 'normal', fontSize: 9, color: '#000'}}>
                          {' | Tech Stack: '}
                          {project.technologies.filter(tech => tech.trim() !== '').join(', ')}
                        </Text>
                      )}
                    </Text>
                  </View>
                </View>
                {project.bullets && project.bullets.filter(bullet => bullet.trim() !== '').length > 0 && (
                  <View style={styles.bullets}>
                    {project.bullets.filter(bullet => bullet.trim() !== '').map((bullet, bulletIndex) => (
                      <Text key={bulletIndex} style={styles.bulletPoint}>
                        • {bullet}
                      </Text>
                    ))}
                  </View>
                )}
                {project.description && project.description.trim() && !project.bullets && (
                  <View style={styles.bullets}>
                    <Text style={styles.bulletPoint}>
                      {project.description}
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Volunteer Section */}
        {resume.volunteer && resume.volunteer.title?.trim() && resume.volunteer.organization?.trim() && (
          <View style={styles.section}>
            <Text style={styles.sectionTitleWithRule}>VOLUNTEER</Text>
            <View style={styles.sectionRule} />
            <View style={styles.entry}>
              <View style={styles.entryHeader}>
                <View style={styles.entryLeft}>
                  <Text style={styles.entryTitle}>{resume.volunteer.title}</Text>
                  <Text style={styles.entrySubtitle}>{resume.volunteer.organization}</Text>
                </View>
                {resume.volunteer.dates?.trim() && (
                  <Text style={styles.entryDate}>{resume.volunteer.dates}</Text>
                )}
              </View>
              {resume.volunteer.responsibilities && resume.volunteer.responsibilities.filter(resp => resp.trim() !== '').length > 0 && (
                <View style={styles.bullets}>
                  {resume.volunteer.responsibilities.filter(resp => resp.trim() !== '').map((bullet, bulletIndex) => (
                    <Text key={bulletIndex} style={styles.bullet}>
                      • {bullet}
                    </Text>
                  ))}
                </View>
              )}
            </View>
          </View>
        )}

        {/* Certifications Section */}
        {resume.certifications && resume.certifications.filter(cert => 
          (typeof cert === 'string' && cert.trim() !== '') || 
          (typeof cert === 'object' && cert.name && cert.name.trim() !== '')
        ).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitleWithRule}>CERTIFICATIONS</Text>
            <View style={styles.sectionRule} />
            <View style={styles.entry}>
              {resume.certifications.filter(cert => 
                (typeof cert === 'string' && cert.trim() !== '') || 
                (typeof cert === 'object' && cert.name && cert.name.trim() !== '')
              ).map((cert, index) => {
                if (typeof cert === 'string') {
                  return (
                    <Text key={index} style={styles.certificationItem}>
                      • {cert}
                    </Text>
                  );
                } else {
                  return (
                    <Text key={index} style={styles.certificationItem}>
                      • {cert.url ? (
                        <Link src={cert.url} style={styles.certificationLink}>
                          {cert.name}
                        </Link>
                      ) : (
                        cert.name
                      )}
                    </Text>
                  );
                }
              })}
            </View>
          </View>
        )}

        {/* Education Section */}
        {resume.education && resume.education.filter(edu => 
          edu.degree?.trim() && edu.institution?.trim()
        ).length > 0 && (
          <View style={[styles.section, styles.sectionProjects]}>
            <Text style={styles.sectionTitleWithRule}>EDUCATION</Text>
            <View style={styles.sectionRule} />
            {resume.education.filter(edu => 
              edu.degree?.trim() && edu.institution?.trim()
            ).map((edu, index) => (
              <View key={index} style={styles.entry}>
                <View style={styles.entryHeader}>
                  <View style={styles.entryLeft}>
                    <Text style={styles.entryTitle}>{edu.degree}</Text>
                    <Text style={styles.entrySubtitle}>
                      {edu.institution}{edu.location && edu.location.trim() ? ` — ${edu.location}` : ''}
                    </Text>
                  </View>
                  {edu.graduation_date?.trim() && (
                    <Text style={styles.entryDate}>{edu.graduation_date}</Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Legacy Sections Support */}
        {resume.sections && resume.sections
          .filter(section => section && section.entries && section.entries.length > 0)
          .map((section, sIndex) => ({ ...section, originalIndex: sIndex }))
          .sort((a, b) => {
            const aTitle = a.title.toLowerCase();
            const bTitle = b.title.toLowerCase();
            
            if (aTitle.includes('experience') || aTitle.includes('work')) return -1;
            if (bTitle.includes('experience') || bTitle.includes('work')) return 1;
            
            if (aTitle.includes('skill')) return -1;
            if (bTitle.includes('skill')) return 1;
            
            if (aTitle.includes('project')) return -1;
            if (bTitle.includes('project')) return 1;
            
            if (aTitle.includes('education')) return -1;
            if (bTitle.includes('education')) return 1;
            
            return a.originalIndex - b.originalIndex;
          })
          .map((section, sIndex) => (
          <View key={sIndex} style={styles.section}>
            <Text style={getSectionTitleStyle(section.title)}>{section.title.toUpperCase()}</Text>
            <View style={styles.sectionRule} />

            {section.title.toLowerCase().includes("skill") ? (
              section.entries.map((entry, eIndex) => (
                <View key={eIndex} style={styles.skillsGroup}>
                  {/* Add checks for entry.category and entry.skills */}
                  {entry.category && entry.skills && (
                    <Text>
                      <Text style={styles.skillCategory}>{entry.category}: </Text>
                      <Text style={styles.skillList}>
                        {entry.skills.length > 0
                          ? entry.skills.join(', ')
                          : '—'}
                      </Text>
                    </Text>
                  )}
                </View>
              ))
            ) : (
              section.entries.map((entry, eIndex) => (
                <View key={eIndex} style={styles.entry}>
                  {/* Add checks for entry properties */}
                  <View style={styles.entryHeader}>
                    <View style={styles.entryLeft}>
                      <Text style={styles.entryTitle}>
                        {entry.job_title || entry.name || entry.degree || entry.category || ''}
                      </Text>
                      <Text style={styles.entrySub}>
                        {[entry.company || entry.institution, entry.location]
                          .filter(Boolean)
                          .join(' — ')}
                      </Text>
                    </View>
                    <Text style={styles.entryDate}>
                      {entry.date_range || entry.date || ''}
                    </Text>
                  </View>

                  {entry.bullets && entry.bullets.length > 0 && (
                    <View style={styles.bullets}>
                      {entry.bullets
                        .filter(b => b && b.text && b.enabled)
                        .map((b, bIndex) => (
                          <Text key={bIndex} style={styles.bullet}>• {b.text}</Text>
                        ))}
                    </View>
                  )}

{entry.tech_stack && entry.tech_stack.length > 0 && (
                    <Text style={styles.techStack}>
                      <Text style={{ fontWeight: 'bold' }}>Tech Stack:</Text> {entry.tech_stack.join(', ')}
                    </Text>
                  )}
                </View>
              ))
            )}
          </View>
        ))}
      </Page>
    </Document>
  );
};

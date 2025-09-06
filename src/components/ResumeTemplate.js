import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// Fonts
Font.register({
  family: 'Helvetica',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/helveticaneue/v70/1Ptsg8zYS_SKggPNyC0IT4ttDfA.ttf', fontWeight: 'normal' },
    { src: 'https://fonts.gstatic.com/s/helveticaneue/v70/1Ptsg8zYS_SKggPNyC0IT4ttDfB.ttf', fontWeight: 'bold' }
  ]
});

const styles = StyleSheet.create({
  page: {
    paddingTop: 36, // 0.5 inch top margin (reduced from 1 inch)
    paddingBottom: 36, // 0.5 inch bottom margin (reduced from 1 inch)
    paddingLeft: 36, // 0.5 inch left margin
    paddingRight: 36, // 0.5 inch right margin
    fontSize: 10,
    fontFamily: 'Helvetica',
    lineHeight: 1.0, // Single-spaced
    color: '#000'
  },
  header: {
    textAlign: 'center',
    marginBottom: 12
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#000'
  },
  contact: {
    fontSize: 9,
    color: '#000',
    lineHeight: 1.2
  },
  section: {
    marginBottom: 14
  },
  sectionTitleWithRule: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 3,
    textTransform: 'uppercase',
    textAlign: 'center',
    color: '#000'
  },
  sectionRule: {
    borderBottom: '0.5pt solid #000',
    marginBottom: 6
  },
  entry: {
    marginBottom: 10
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 3
  },
  entryLeft: {
    flex: 1
  },
  entryTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 1
  },
  entrySub: {
    fontSize: 9,
    color: '#000'
  },
  entryDate: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'right'
  },
  bullets: {
    marginLeft: 10,
    marginTop: 3
  },
  bullet: {
    fontSize: 9,
    marginBottom: 2,
    color: '#000',
    lineHeight: 1.2
  },
  techStack: {
    fontSize: 8,
    // fontStyle: 'italic',
    marginTop: 3,
    color: '#000'
  },
  skillsGroup: {
    marginBottom: 4
  },
  skillCategory: {
    fontWeight: 'bold',
    fontSize: 9,
    color: '#000'
  },
  skillList: {
    fontSize: 9,
    color: '#000'
  },
  summary: {
    fontSize: 9,
    lineHeight: 1.3,
    color: '#000'
  },
  jobEntry: {
    marginBottom: 10
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 3
  },
  jobTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 1
  },
  jobCompany: {
    fontSize: 9,
    color: '#000'
  },
  jobLocation: {
    fontSize: 9,
    color: '#000'
  },
  jobDates: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'right'
  },
  educationEntry: {
    marginBottom: 8
  },
  degree: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 1
  },
  institution: {
    fontSize: 9,
    color: '#000'
  },
  educationLocation: {
    fontSize: 9,
    color: '#000'
  },
  graduationDate: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#000'
  },
  skillCategory: {
    marginBottom: 4
  },
  skillCategoryTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 2
  },
  skills: {
    fontSize: 9,
    color: '#000',
    lineHeight: 1.2
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

  // Helper function to safely render contact info
  const renderContactInfo = () => {
    if (!resume.contact) return null;
    
    const contactParts = [];
    if (resume.contact.phone) contactParts.push(resume.contact.phone);
    if (resume.contact.email) contactParts.push(resume.contact.email);
    if (resume.contact.linkedin) contactParts.push(resume.contact.linkedin);
    
    if (contactParts.length === 0) return null;
    
    return <Text style={styles.contact}>{contactParts.join(' • ')}</Text>;
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
      
      if (isEnabled && text) {
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
        {resume.summary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitleWithRule}>SUMMARY</Text>
            <View style={styles.sectionRule} />
            <Text style={styles.summary}>{resume.summary}</Text>
          </View>
        )}

        {/* Experience Section */}
        {resume.experience && resume.experience.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitleWithRule}>PROFESSIONAL EXPERIENCE</Text>
            <View style={styles.sectionRule} />
            {resume.experience.map((job, index) => (
              <View key={index} style={styles.jobEntry}>
                <View style={styles.jobHeader}>
                  <Text style={styles.jobTitle}>{job.title}</Text>
                  <Text style={styles.jobCompany}>{job.company}</Text>
                  <Text style={styles.jobLocation}>{job.location}</Text>
                  <Text style={styles.jobDates}>{job.dates}</Text>
                </View>
                {job.responsibilities && job.responsibilities.length > 0 && (
                  <View style={styles.bullets}>
                    {renderResponsibilities(job.responsibilities)}
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Education Section */}
        {resume.education && resume.education.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitleWithRule}>EDUCATION</Text>
            <View style={styles.sectionRule} />
            {resume.education.map((edu, index) => (
              <View key={index} style={styles.educationEntry}>
                <Text style={styles.degree}>{edu.degree}</Text>
                <Text style={styles.institution}>{edu.institution}</Text>
                <Text style={styles.educationLocation}>{edu.location}</Text>
                <Text style={styles.graduationDate}>{edu.graduation_date}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Technical Skills Section */}
        {resume.technical_skills && Object.keys(resume.technical_skills).length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitleWithRule}>TECHNICAL SKILLS</Text>
            <View style={styles.sectionRule} />
            {Object.entries(resume.technical_skills).map(([category, skills]) => (
              skills.length > 0 && (
                <View key={category} style={styles.skillCategory}>
                  <Text style={styles.skillCategoryTitle}>
                    {category.replace(/_/g, ' ').toUpperCase()}
                  </Text>
                  <Text style={styles.skills}>
                    {skills.join(', ')}
                  </Text>
                </View>
              )
            ))}
          </View>
        )}

        {/* Volunteer Section */}
        {resume.volunteer && resume.volunteer.title && (
          <View style={styles.section}>
            <Text style={styles.sectionTitleWithRule}>VOLUNTEER</Text>
            <View style={styles.sectionRule} />
            <View style={styles.jobEntry}>
              <View style={styles.jobHeader}>
                <Text style={styles.jobTitle}>{resume.volunteer.title}</Text>
                <Text style={styles.jobCompany}>{resume.volunteer.organization}</Text>
                <Text style={styles.jobDates}>{resume.volunteer.dates}</Text>
              </View>
              {resume.volunteer.responsibilities && resume.volunteer.responsibilities.length > 0 && (
                <View style={styles.bullets}>
                  {resume.volunteer.responsibilities.map((bullet, bulletIndex) => (
                    <Text key={bulletIndex} style={styles.bullet}>
                      • {bullet}
                    </Text>
                  ))}
                </View>
              )}
            </View>
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
                        {[entry.company, entry.location, entry.institution]
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

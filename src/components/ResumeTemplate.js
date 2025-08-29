import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// Register fonts for better typography
Font.register({
  family: 'Helvetica',
  fonts: [
    { src: 'https://fonts.gstatic.com/s/helveticaneue/v70/1Ptsg8zYS_SKggPNyC0IT4ttDfA.ttf', fontWeight: 'normal' },
    { src: 'https://fonts.gstatic.com/s/helveticaneue/v70/1Ptsg8zYS_SKggPNyC0IT4ttDfB.ttf', fontWeight: 'bold' },
    { src: 'https://fonts.gstatic.com/s/helveticaneue/v70/1Ptsg8zYS_SKggPNyC0IT4ttDfC.ttf', fontStyle: 'italic' }
  ]
});

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    fontFamily: 'Helvetica',
    lineHeight: 1.4,
    color: '#333'
  },
  header: {
    marginBottom: 20,
    borderBottom: '1px solid #333',
    paddingBottom: 10
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#2c3e50'
  },
  contact: {
    textAlign: 'center',
    fontSize: 10,
    color: '#666',
    marginBottom: 5
  },
  summary: {
    marginBottom: 15,
    textAlign: 'justify'
  },
  section: {
    marginBottom: 15
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#2c3e50',
    borderBottom: '1px solid #bdc3c7',
    paddingBottom: 3
  },
  entry: {
    marginBottom: 12
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4
  },
  entryTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#34495e'
  },
  entryDetails: {
    fontSize: 10,
    color: '#666',
    fontStyle: 'italic'
  },
  entryDate: {
    fontSize: 10,
    color: '#666',
    fontStyle: 'italic'
  },
  bullets: {
    marginLeft: 10,
    marginTop: 4
  },
  bullet: {
    marginBottom: 3,
    fontSize: 9
  },
  techStack: {
    fontSize: 9,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 4
  },
  skills: {
    fontSize: 9,
    color: '#666',
    marginTop: 4
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4
  },
  skillChip: {
    backgroundColor: '#ecf0f1',
    padding: '2px 6px',
    marginRight: 4,
    marginBottom: 2,
    borderRadius: 3,
    fontSize: 8
  }
});

export const ResumeTemplate = ({ resume }) => {
  if (!resume || !resume.sections) {
    return (
      <Document>
        <Page size="A4" style={styles.page}>
          <Text>No resume data available</Text>
        </Page>
      </Document>
    );
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          {resume.metadata?.name && (
            <Text style={styles.name}>{resume.metadata.name.toUpperCase()}</Text>
          )}
          
          {resume.metadata?.contact && (
            <View>
              <Text style={styles.contact}>
                {[
                  resume.metadata.contact.email,
                  resume.metadata.contact.phone,
                  ...(resume.metadata.contact.links || [])
                ].filter(Boolean).join(' | ')}
              </Text>
            </View>
          )}
        </View>

        {/* Summary */}
        {resume.metadata?.summary && (
          <View style={styles.summary}>
            <Text>{resume.metadata.summary}</Text>
          </View>
        )}

        {/* Sections */}
        {resume.sections.map((section, sectionIndex) => (
          <View key={`section-${sectionIndex}`} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title.toUpperCase()}</Text>
            
            {section.entries.map((entry, entryIndex) => (
              <View key={`entry-${sectionIndex}-${entryIndex}`} style={styles.entry}>
                {/* Entry Header */}
                <View style={styles.entryHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.entryTitle}>
                      {entry.job_title || entry.name || entry.degree || entry.category || 'Untitled'}
                    </Text>
                    <Text style={styles.entryDetails}>
                      {[
                        entry.company,
                        entry.location,
                        entry.institution
                      ].filter(Boolean).join(' | ')}
                    </Text>
                  </View>
                  <Text style={styles.entryDate}>
                    {entry.date_range || entry.date || ''}
                  </Text>
                </View>

                {/* Bullets */}
                {entry.bullets && entry.bullets.length > 0 && (
                  <View style={styles.bullets}>
                    {entry.bullets
                      .filter(bullet => bullet.enabled)
                      .map((bullet, bulletIndex) => (
                        <Text key={bullet.id} style={styles.bullet}>
                          • {bullet.text}
                        </Text>
                      ))}
                  </View>
                )}

                {/* Tech Stack */}
                {entry.tech_stack && entry.tech_stack.length > 0 && (
                  <Text style={styles.techStack}>
                    Tech Stack: {entry.tech_stack.join(', ')}
                  </Text>
                )}

                {/* Skills */}
                {entry.skills && entry.skills.length > 0 && (
                  <View style={styles.skillsContainer}>
                    {entry.skills.map((skill, skillIndex) => (
                      <Text key={skillIndex} style={styles.skillChip}>
                        {skill}
                      </Text>
                    ))}
                  </View>
                )}
              </View>
            ))}
          </View>
        ))}
      </Page>
    </Document>
  );
};

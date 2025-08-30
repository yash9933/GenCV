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
    fontSize: 24,
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
  }
});

export const ResumeTemplate = ({ resume }) => {
  // Check if resume or its sections are null/undefined at the top
  if (!resume || !resume.sections) {
    return (
      <Document>
        <Page size="LETTER" style={styles.page}>
          <Text>No resume data available</Text>
        </Page>
      </Document>
    );
  }

  // Define a temporary function to handle the title style consistently
  const getSectionTitleStyle = (title) => {
    return styles.sectionTitleWithRule;
  };

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          {resume.metadata && resume.metadata.name && (
            <Text style={styles.name}>{resume.metadata.name}</Text>
          )}
          {resume.metadata && resume.metadata.contact && (
            <Text style={styles.contact}>
              {[
                resume.metadata.contact.phone,
                resume.metadata.contact.email,
                ...(resume.metadata.contact.links || [])
              ]
                .filter(Boolean)
                .join(' • ')}
            </Text>
          )}
        </View>

        {/* Summary */}
        {resume.metadata && resume.metadata.summary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitleWithRule}>SUMMARY</Text>
            <View style={styles.sectionRule} />
            <Text style={styles.summary}>{resume.metadata.summary}</Text>
          </View>
        )}

        {/* Sections */}
        {resume.sections
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

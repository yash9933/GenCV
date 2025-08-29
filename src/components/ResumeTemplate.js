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
    padding: 36,
    fontSize: 10,
    fontFamily: 'Helvetica',
    lineHeight: 1.35,
    color: '#111'
  },
  header: {
    textAlign: 'center',
    marginBottom: 20
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4
  },
  contact: {
    fontSize: 9,
    color: '#222'
  },
  section: {
    marginBottom: 14
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    marginBottom: 6,
    borderBottom: '1.2pt solid #000',
    paddingBottom: 2,
    textTransform: 'uppercase'
  },
  entry: {
    marginBottom: 8
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2
  },
  entryTitle: {
    fontSize: 10.5,
    fontWeight: 'bold'
  },
  entrySub: {
    fontSize: 9.5,
    color: '#444'
  },
  entryDate: {
    fontSize: 9.5,
    color: '#444',
    fontStyle: 'italic'
  },
  bullets: {
    marginLeft: 12,
    marginTop: 2
  },
  bullet: {
    fontSize: 9,
    marginBottom: 2
  },
  techStack: {
    fontSize: 8.5,
    fontStyle: 'italic',
    marginTop: 2,
    color: '#555'
  },
  skillsGroup: {
    marginBottom: 4
  },
  skillCategory: {
    fontWeight: 'bold',
    fontSize: 10,
    color: '#000'
  },
  skillList: {
    fontSize: 10,
    color: '#222'
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
            <Text style={styles.name}>{resume.metadata.name}</Text>
          )}
          {resume.metadata?.contact && (
            <Text style={styles.contact}>
              {[resume.metadata.contact.phone, resume.metadata.contact.email, ...(resume.metadata.contact.links || [])]
                .filter(Boolean)
                .join(' • ')}
            </Text>
          )}
        </View>

        {/* Summary */}
        {resume.metadata?.summary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>SUMMARY</Text>
            <Text>{resume.metadata.summary}</Text>
          </View>
        )}

        {/* Sections */}
        {resume.sections.map((section, sIndex) => (
          <View key={sIndex} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title.toUpperCase()}</Text>

            {section.title.toLowerCase().includes("skill") ? (
                section.entries.map((entry, eIndex) => (
                  <View key={eIndex} style={styles.skillsGroup}>
                    <Text>
                      <Text style={styles.skillCategory}>{entry.category}: </Text>
                      <Text style={styles.skillList}>
                        {entry.skills && entry.skills.length > 0
                          ? entry.skills.join(', ')
                          : '—'}
                      </Text>
                    </Text>
                  </View>
                ))
              ) : (
              section.entries.map((entry, eIndex) => (
                <View key={eIndex} style={styles.entry}>
                  {/* Entry Header */}
                  <View style={styles.entryHeader}>
                    <View>
                      <Text style={styles.entryTitle}>
                        {entry.job_title || entry.name || entry.degree || entry.category}
                      </Text>
                      <Text style={styles.entrySub}>
                        {[entry.company, entry.location, entry.institution]
                          .filter(Boolean)
                          .join(' | ')}
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
                        .filter(b => b.enabled)
                        .map((b, bIndex) => (
                          <Text key={bIndex} style={styles.bullet}>• {b.text}</Text>
                        ))}
                    </View>
                  )}

                  {/* Tech stack */}
                  {entry.tech_stack && entry.tech_stack.length > 0 && (
                    <Text style={styles.techStack}>
                      Tech Stack: {entry.tech_stack.join(', ')}
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

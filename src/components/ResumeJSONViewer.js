import React from 'react';
import { useAppContext } from '../context/AppContext';


const ResumeJSONViewer = () => {
  const { state } = useAppContext();
  const { resumeJSON } = state;

  if (!resumeJSON || Object.keys(resumeJSON).length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Resume JSON Viewer
          </h2>
          <p className="text-gray-600">No resume data extracted yet.</p>
        </div>
      </div>
    );
  }

  const formattedText = JSON.stringify(resumeJSON, null, 2);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Extracted Resume Data
        </h2>
        
        {/* JSON Data */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Structured JSON:</h3>
          <div className="bg-gray-100 p-4 rounded-lg overflow-auto max-h-96">
            <pre className="text-sm text-gray-700 whitespace-pre-wrap">
              {JSON.stringify(resumeJSON, null, 2)}
            </pre>
          </div>
        </div>

        {/* Formatted Text */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Formatted Text:</h3>
          <div className="bg-gray-50 p-4 rounded-lg border">
            <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
              {formattedText}
            </pre>
          </div>
        </div>

        {/* Section Summary */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-800">Contact Info</h4>
            <p className="text-blue-600 text-sm">
              {(resumeJSON.name || resumeJSON.metadata?.name) ? '✓ Name' : '✗ No name'}
            </p>
            <p className="text-blue-600 text-sm">
              {(resumeJSON.contact?.email || resumeJSON.metadata?.contact?.email) ? '✓ Email' : '✗ No email'}
            </p>
            <p className="text-blue-600 text-sm">
              {(resumeJSON.contact?.phone || resumeJSON.metadata?.contact?.phone) ? '✓ Phone' : '✗ No phone'}
            </p>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-semibold text-green-800">Experience</h4>
            <p className="text-green-600 text-sm">
              {resumeJSON.experience?.length || resumeJSON.sections?.length || 0} total positions
            </p>
            <p className="text-green-600 text-sm">
              {resumeJSON.experience?.reduce((total, job) => total + (job.responsibilities?.length || 0), 0) || 
               resumeJSON.sections?.reduce((total, section) => total + section.entries.length, 0) || 0} total entries
            </p>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="font-semibold text-purple-800">Responsibilities</h4>
            <p className="text-purple-600 text-sm">
              {resumeJSON.experience?.reduce((total, job) => total + (job.responsibilities?.length || 0), 0) || 
               resumeJSON.sections?.reduce((total, section) => 
                 total + section.entries.reduce((entryTotal, entry) => 
                   entryTotal + (entry.bullets?.length || 0), 0
                 ), 0) || 0} total responsibilities
            </p>
            <p className="text-purple-600 text-sm">
              {resumeJSON.sections?.reduce((total, section) => 
                total + section.entries.reduce((entryTotal, entry) => 
                  entryTotal + (entry.bullets?.filter(b => b.enabled)?.length || 0), 0
                ), 0) || 0} enabled bullets (legacy)
            </p>
          </div>

          <div className="bg-orange-50 p-4 rounded-lg">
            <h4 className="font-semibold text-orange-800">Skills & Education</h4>
            <p className="text-orange-600 text-sm">
              {Object.keys(resumeJSON.technical_skills || {}).length} skill categories
            </p>
            <p className="text-orange-600 text-sm">
              {resumeJSON.education?.length || 0} education entries
            </p>
            <p className="text-orange-600 text-sm">
              {resumeJSON.certifications?.length || 0} certifications
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeJSONViewer;

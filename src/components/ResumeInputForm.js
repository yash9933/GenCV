'use client';

import { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { parsePDF, extractSkillsFromJD } from '../lib/utils';
import Button from './ui/Button';
import Textarea from './ui/Textarea';
import toast from 'react-hot-toast';

/**
 * Resume Input Form Component
 * Handles job description and resume input
 */
const ResumeInputForm = () => {
  const { state, actions } = useAppContext();
  const [isProcessingFile, setIsProcessingFile] = useState(false);

  /**
   * Handle file upload
   */
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (file.type !== 'application/pdf') {
      toast.error('Please upload a PDF file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    setIsProcessingFile(true);
    
    try {
      console.log('Processing PDF file:', file.name);
      const text = await parsePDF(file);
      actions.setOriginalResume(text);
      toast.success('PDF processed successfully');
    } catch (error) {
      console.error('Error processing PDF:', error);
      toast.error('Failed to process PDF file');
    } finally {
      setIsProcessingFile(false);
    }
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!state.jobDescription.trim()) {
      toast.error('Please fill in the job description');
      return;
    }

    if (!state.originalResume.trim()) {
      toast.error('Please provide your resume (upload PDF or paste text)');
      return;
    }

    try {
      console.log('Extracting skills from job description...');
      
      // Extract skills from job description
      const skills = extractSkillsFromJD(state.jobDescription);
      actions.setSuggestedSkills(skills);
      
      // Set all skills as selected by default
      actions.setSelectedSkills(skills);
      
      // Move to skills selection step
      actions.setInputSubmitted(true);
      actions.setCurrentStep('skills');
      
      toast.success('Skills extracted successfully');
      
    } catch (error) {
      console.error('Error extracting skills:', error);
      toast.error('Failed to extract skills from job description');
    }
  };

  /**
   * Handle input changes
   */
  const handleJobDescriptionChange = (event) => {
    actions.setJobDescription(event.target.value);
  };

  const handleResumeChange = (event) => {
    actions.setOriginalResume(event.target.value);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          AI Resume Builder
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Job Description */}
          <div>
            <Textarea
              label="Job Description"
              value={state.jobDescription}
              onChange={handleJobDescriptionChange}
              placeholder="Paste the job description here..."
              rows={8}
              required
            />
          </div>

          {/* Resume Input */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Resume (Paste your resume text)
              </label>
              
              {/* File Upload - Currently Disabled */}
              <div className="mb-4">
                <div className="p-4 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg text-center">
                  <p className="text-sm text-gray-600 mb-2">
                    📄 PDF Upload (Coming Soon)
                  </p>
                  <p className="text-xs text-gray-500">
                    PDF parsing is currently being improved. Please paste your resume text below.
                  </p>
                </div>
              </div>
              
              {/* Text Input */}
              <Textarea
                label="Resume Text"
                value={state.originalResume}
                onChange={handleResumeChange}
                placeholder="Paste your resume text here..."
                rows={12}
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={!state.jobDescription.trim() || !state.originalResume.trim()}
            >
              Extract Skills & Continue
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResumeInputForm;


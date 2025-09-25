'use client';

import { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { parsePDF, extractSkillsFromJD, extractResumeToJSON } from '../lib/utils';
import Button from './ui/Button';
import Textarea from './ui/Textarea';
import LoadingPopup from './LoadingPopup';
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
   * Handle form submission - now includes resume parsing and skill extraction
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

    actions.setGenerating(true);
    actions.setError(null);

    try {
      console.log('=== STARTING EXTRACT SKILLS ===');
      console.log('Function called successfully!');
      console.log('Current state:', {
        jobDescription: state.jobDescription,
        originalResume: state.originalResume,
        hasJobDescription: !!state.jobDescription,
        hasResumeText: !!state.originalResume,
        resumeTextLength: state.originalResume?.length || 0
      });
      
      console.log('Extracting skills from resume and job description...');
      console.log('Making API call to /api/parse-resume...');
      
      const requestBody = {
        jobDescription: state.jobDescription,
        resumeText: state.originalResume,
      };
      
      console.log('Request body:', requestBody);
      
      const response = await fetch('/api/parse-resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      console.log('API response status:', response.status);
      console.log('API response ok:', response.ok);

      const data = await response.json();
      console.log('Raw API response data:', data);

      if (!response.ok) {
        console.error('API call failed:', data);
        throw new Error(data.error || 'Failed to parse resume and extract skills');
      }

      console.log('Resume parsed and skills extracted successfully:', data);
      console.log('Full API response:', JSON.stringify(data, null, 2));

      // Process the parsed resume and extracted skills
      const { parsedResume, suggestedSkills } = data.data;
      console.log('Extracted parsedResume:', parsedResume);
      console.log('Extracted suggestedSkills:', suggestedSkills);
      console.log('parsedResume type:', typeof parsedResume);
      console.log('parsedResume keys:', parsedResume ? Object.keys(parsedResume) : 'null/undefined');

      // Store the parsed resume JSON
      if (parsedResume) {
        console.log('Setting parsed resume JSON:', parsedResume);
        actions.setResumeJSON(parsedResume);
        console.log('Resume JSON set successfully');
      } else {
        console.error('No parsedResume found in API response');
        console.error('data.data structure:', data.data);
      }

      // Set suggested skills (all unchecked by default)
      if (suggestedSkills && suggestedSkills.length > 0) {
        console.log('Setting suggested skills:', suggestedSkills);
        actions.setSuggestedSkills(suggestedSkills);
        actions.setSelectedSkills([]); // All unchecked by default
      }

      // Move to skills selection step
      actions.setInputSubmitted(true);
      actions.setCurrentStep('skills');
      
      toast.success('Resume parsed and skills extracted successfully!');
      
    } catch (error) {
      console.error('Error parsing resume:', error);
      actions.setError(error.message);
      toast.error(`Error: ${error.message}`);
    } finally {
      actions.setGenerating(false);
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
    <div className="max-w-5xl mx-auto p-4 h-full">
      <div className="bg-white rounded-lg shadow-lg p-6 h-full flex flex-col">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          AI Resume Builder
        </h2>
        
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col space-y-4">
          {/* Two Column Layout */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6">
                         {/* Job Description */}
             <div className="flex flex-col">
               <Textarea
                 label="Job Description"
                 value={state.jobDescription}
                 onChange={handleJobDescriptionChange}
                 placeholder="Paste the job description here..."
                 rows={17}
                 required
                 className="flex-1"
               />
             </div>

             {/* Resume Input */}
             <div className="flex flex-col space-y-4">
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-2">
                   Resume (Upload PDF or paste text)
                 </label>
                 
                 {/* File Upload */}
                 <div className="mb-4">
                   <div className="p-4 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg text-center">
                     <input
                       type="file"
                       accept=".pdf"
                       onChange={handleFileUpload}
                       className="hidden"
                       id="resume-upload"
                       disabled={isProcessingFile}
                     />
                     <label
                       htmlFor="resume-upload"
                       className={`cursor-pointer block ${isProcessingFile ? 'opacity-50 cursor-not-allowed' : ''}`}
                     >
                       <div className="flex flex-col items-center">
                         <div className="text-xl mb-1">📄</div>
                         <p className="text-xs text-gray-600 mb-1">
                           {isProcessingFile ? 'Processing PDF...' : 'Click to upload PDF resume'}
                         </p>
                         <p className="text-xs text-gray-500">
                           {isProcessingFile ? 'Please wait...' : 'or paste your resume text below'}
                         </p>
                       </div>
                     </label>
                   </div>
                 </div>
               </div>
               
               {/* Text Input */}
               <div className="flex-1">
                 <Textarea
                   label="Resume Text"
                   value={state.originalResume}
                   onChange={handleResumeChange}
                   placeholder="Paste your resume text here..."
                   rows={10}
                   className="flex-1"
                 />
               </div>
             </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-6">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={!state.jobDescription.trim() || !state.originalResume.trim() || state.isGenerating}
            >
              {state.isGenerating ? 'Processing...' : 'Continue'}
            </Button>
          </div>
        </form>
      </div>
      
      {/* Loading Popup */}
      <LoadingPopup isVisible={state.isGenerating} type="parsing" />
    </div>
  );
};

export default ResumeInputForm;


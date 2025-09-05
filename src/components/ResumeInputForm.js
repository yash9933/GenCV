'use client';

import { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { parsePDF, extractSkillsFromJD, extractResumeToJSON } from '../lib/utils';
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
      console.log('Parsing resume with AI...');
      
      // Parse resume using AI
      const response = await fetch('/api/parse-resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resumeText: state.originalResume,
          jobDescription: state.jobDescription,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to parse resume');
      }

      console.log('Parsed resume JSON:', data.data);
      
      // Store the structured resume data
      actions.setResumeJSON(data.data);
      
      console.log('Extracting skills from job description...');
      
      // Extract skills from job description
      const skills = extractSkillsFromJD(state.jobDescription);
      actions.setSuggestedSkills(skills);
      
      // Set all skills as selected by default
      actions.setSelectedSkills(skills);
      
      // Move to skills selection step
      actions.setInputSubmitted(true);
      actions.setCurrentStep('skills');
      
      toast.success('Resume parsed and skills extracted successfully');
      
    } catch (error) {
      console.error('Error processing resume:', error);
      toast.error('Failed to process resume');
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
    <div className="max-w-6xl mx-auto p-8 h-full">
      <div className="bg-white rounded-lg shadow-lg p-10 h-full flex flex-col">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          AI Resume Builder
        </h2>
        
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col space-y-6">
          {/* Two Column Layout */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8">
                         {/* Job Description */}
             <div className="flex flex-col">
               <Textarea
                 label="Job Description"
                 value={state.jobDescription}
                 onChange={handleJobDescriptionChange}
                 placeholder="Paste the job description here..."
                 rows={18}
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
                   rows={11}
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


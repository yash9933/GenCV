'use client';

import { useAppContext } from '../context/AppContext';
import { generateId, extractBulletPoints } from '../lib/utils';
import Button from './ui/Button';
import Checkbox from './ui/Checkbox';
import toast from 'react-hot-toast';

// Helper function to extract resume metadata
const extractResumeMetadata = (resumeJSON) => {
  if (!resumeJSON) return null;
  
  return {
    name: resumeJSON.name || '',
    title: resumeJSON.title || '',
    summary: resumeJSON.summary || '',
    contact: resumeJSON.contact || {},
    // Calculate years of experience from experience array
    yearsOfExperience: calculateYearsOfExperience(resumeJSON.experience || [])
  };
};

// Helper function to calculate years of experience
const calculateYearsOfExperience = (experience) => {
  if (!experience || experience.length === 0) return 0;
  
  // Simple calculation - could be more sophisticated
  return Math.max(1, Math.floor(experience.length * 2)); // Rough estimate
};

// Helper function to extract selected/enabled bullets
const extractSelectedBullets = (resumeJSON) => {
  if (!resumeJSON) return [];
  
  const bullets = [];
  
  // Extract from experience section
  if (resumeJSON.experience && Array.isArray(resumeJSON.experience)) {
    resumeJSON.experience.forEach(job => {
      if (job.responsibilities && Array.isArray(job.responsibilities)) {
        job.responsibilities.forEach(resp => {
          // Handle both string and object formats
          if (typeof resp === 'string') {
            bullets.push(resp);
          } else if (resp && resp.text && resp.enabled !== false) {
            bullets.push(resp.text);
          }
        });
      }
    });
  }
  
  // Extract from sections (old schema)
  if (resumeJSON.sections && Array.isArray(resumeJSON.sections)) {
    resumeJSON.sections.forEach(section => {
      if (section.entries && Array.isArray(section.entries)) {
        section.entries.forEach(entry => {
          if (entry.bullets && Array.isArray(entry.bullets)) {
            entry.bullets.forEach(bullet => {
              if (bullet.enabled !== false && bullet.text) {
                bullets.push(bullet.text);
              }
            });
          }
        });
      }
    });
  }
  
  return bullets;
};

/**
 * Skill Checklist Component
 * Displays suggested skills for user selection
 */
const SkillChecklist = () => {
  const { state, actions } = useAppContext();

  /**
   * Handle skill selection
   */
  const handleSkillToggle = (skill) => {
    const isSelected = state.selectedSkills.includes(skill);
    
    if (isSelected) {
      actions.setSelectedSkills(state.selectedSkills.filter(s => s !== skill));
    } else {
      actions.setSelectedSkills([...state.selectedSkills, skill]);
    }
  };

  /**
   * Copy JSON to clipboard for debugging
   */
  const handleCopyJSON = async () => {
    try {
      const jsonString = JSON.stringify(state.resumeJSON, null, 2);
      await navigator.clipboard.writeText(jsonString);
      toast.success('JSON copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy JSON:', error);
      toast.error('Failed to copy JSON to clipboard');
    }
  };

  /**
   * Handle extract skills and continue (Step 1)
   */
  const handleExtractSkills = async () => {
    console.log('=== STARTING EXTRACT SKILLS ===');
    console.log('Function called successfully!');
    console.log('Current state:', {
      jobDescription: state.jobDescription,
      originalResume: state.originalResume,
      hasJobDescription: !!state.jobDescription,
      hasResumeText: !!state.originalResume,
      resumeTextLength: state.originalResume?.length || 0
    });
    
    actions.setGenerating(true);
    actions.setError(null);

    try {
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
   * Handle generate documents (Step 2)
   */
  const handleGenerateDocuments = async () => {
    if (state.selectedSkills.length === 0) {
      toast.error('Please select at least one skill');
      return;
    }

    actions.setGenerating(true);
    actions.setError(null);

    try {
      console.log('Generating documents with selected skills:', state.selectedSkills);
      console.log('Request data:', {
        jobDescription: state.jobDescription?.length,
        resumeText: state.originalResume?.length,
        selectedSkills: state.selectedSkills
      });
      
      const response = await fetch('/api/generate-documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobDescription: state.jobDescription,
          resumeText: state.originalResume,
          selectedSkills: state.selectedSkills,
          resumeMetadata: extractResumeMetadata(state.resumeJSON),
          selectedBullets: extractSelectedBullets(state.resumeJSON),
        }),
      });
      
      console.log('API response status:', response.status);
      console.log('API response ok:', response.ok);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate documents');
      }

      console.log('Documents generated successfully:', data);
      console.log('Data structure:', Object.keys(data));
      console.log('Data.data structure:', data.data ? Object.keys(data.data) : 'data.data is undefined');

      // Process the generated content
      const { newBullets, coverLetter } = data.data;

      // Process new bullets - flatten all categories into a single array
      let allNewBullets = [];
      if (newBullets && Array.isArray(newBullets)) {
        allNewBullets = newBullets.flatMap(category => 
          category.bullets.map(bullet => {
            const id = generateId();
            console.log('Generated bullet ID:', id, 'for text:', bullet.substring(0, 50) + '...');
            return {
              id: id,
              text: bullet,
              category: category.category,
              isEnabled: false // All generated bullets start as disabled
            };
          })
        );
      } else {
        console.warn('newBullets is not an array or is undefined:', newBullets);
      }

       // Use the current resume JSON (already parsed in step 1)
       const updatedResumeJSON = { ...state.resumeJSON };

       // Add AI bullets to the resume JSON structure
       if (allNewBullets.length > 0) {
         // Integrate AI bullets with the new schema experience section
         
         if (updatedResumeJSON.experience && updatedResumeJSON.experience.length > 0) {
           const experienceCount = updatedResumeJSON.experience.length;
           
           // Distribute AI bullets evenly across all experience entries
           const bulletsPerExperience = Math.ceil(allNewBullets.length / experienceCount);
           
           console.log(`Distributing ${allNewBullets.length} AI bullets across ${experienceCount} experiences (${bulletsPerExperience} bullets per experience)`);
           
           // Distribute bullets across all experiences
           allNewBullets.forEach((aiBullet, index) => {
             const experienceIndex = Math.floor(index / bulletsPerExperience);
             
             // Ensure we don't exceed the number of experiences
             if (experienceIndex < experienceCount) {
               const job = updatedResumeJSON.experience[experienceIndex];
               if (!job.responsibilities) {
                 job.responsibilities = [];
               }
               
               // Add AI bullet at the TOP of the responsibilities array (unshift instead of push)
               job.responsibilities.unshift({
                 text: aiBullet.text,
                 enabled: false, // AI bullets start as disabled
                 origin: 'ai',
                 category: aiBullet.category
               });
               
               console.log(`Added AI bullet to experience ${experienceIndex + 1}: ${aiBullet.text.substring(0, 50)}...`);
             }
           });
           
           // Update the resume JSON with AI bullets integrated
           actions.setResumeJSON(updatedResumeJSON);
           console.log('AI bullets distributed across all experience sections:', allNewBullets.length, 'bullets added');
           console.log('Updated resume JSON with AI bullets:', updatedResumeJSON);
         }
       }
       
       actions.setGeneratedBullets(allNewBullets);
       actions.setCoverLetter(coverLetter || '');
       actions.setCurrentStep('editor');
      
      toast.success('AI bullets generated successfully!');

    } catch (error) {
      console.error('Error generating documents:', error);
      actions.setError(error.message);
      toast.error(`Failed to generate documents: ${error.message}`);
    } finally {
      actions.setGenerating(false);
    }
  };

  /**
   * Handle back button
   */
  const handleBack = () => {
    actions.setInputSubmitted(false);
    actions.setCurrentStep('input');
    actions.setSuggestedSkills([]);
    actions.setSelectedSkills([]);
  };

  // Check if we have parsed resume data (step 1 completed)
  const hasParsedResume = state.resumeJSON && (
    (state.resumeJSON.experience && state.resumeJSON.experience.length > 0) || 
    (state.resumeJSON.name && state.resumeJSON.name.trim() !== '') ||
    (state.resumeJSON.summary && state.resumeJSON.summary.trim() !== '')
  );
  
  console.log('hasParsedResume check:', {
    hasResumeJSON: !!state.resumeJSON,
    experienceLength: state.resumeJSON?.experience?.length || 0,
    hasName: !!(state.resumeJSON?.name && state.resumeJSON.name.trim() !== ''),
    hasSummary: !!(state.resumeJSON?.summary && state.resumeJSON.summary.trim() !== ''),
    hasParsedResume: hasParsedResume
  });

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {hasParsedResume ? 'Select Skills to Highlight' : 'Extract Skills & Continue'}
          </h2>
          <p className="text-gray-600 mt-2">
            {hasParsedResume 
              ? 'We\'ve identified the following skills from your resume and job description. Select the ones you want to highlight:'
              : 'Click the button below to parse your resume and extract relevant skills from the job description.'
            }
          </p>
        </div>

        {!hasParsedResume ? (
          // Step 1: Extract Skills
          <div className="mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                Step 1: Parse Resume & Extract Skills
              </h3>
              <p className="text-blue-700 mb-4">
                We'll analyze your resume and the job description to identify relevant skills and technologies.
              </p>
              <Button
                variant="primary"
                onClick={handleExtractSkills}
                disabled={state.isGenerating}
                className="px-8"
              >
                {state.isGenerating ? 'Extracting Skills...' : 'Extract Skills & Continue'}
              </Button>
            </div>
          </div>
        ) : (
          // Step 2: Select Skills
          <div className="mb-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <h3 className="text-lg font-semibold text-green-900 mb-2">
                Step 2: Select Skills for AI Generation
              </h3>
              <p className="text-green-700">
                Choose which skills you want AI to generate enhanced bullet points for.
              </p>
            </div>
            
            {state.suggestedSkills.length === 0 ? (
              <p className="text-gray-500 italic">No skills found in the job description.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {state.suggestedSkills.map((skill) => (
                  <div key={skill} className="flex items-center">
                    <Checkbox
                      checked={state.selectedSkills.includes(skill)}
                      onChange={() => handleSkillToggle(skill)}
                      label={skill}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TEMPORARY: JSON Debugging Section */}
        <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-800">
              🐛 Debug: AI-Generated Resume JSON
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyJSON}
              className="text-xs"
            >
              📋 Copy JSON
            </Button>
          </div>
          <div className="bg-white border border-gray-300 rounded p-3 max-h-64 overflow-y-auto">
            <pre className="text-xs text-gray-700 whitespace-pre-wrap">
              {JSON.stringify(state.resumeJSON, null, 2)}
            </pre>
          </div>
          <p className="text-xs text-gray-500 mt-2 italic">
            This section shows the parsed resume data for debugging purposes. 
            It will be removed in production.
          </p>
        </div>

        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {hasParsedResume ? (
              `${state.selectedSkills.length} of ${state.suggestedSkills.length} skills selected`
            ) : (
              'Ready to extract skills from your resume'
            )}
          </div>
          
          <div className="space-x-4">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={state.isGenerating}
            >
              Back
            </Button>
            
            {hasParsedResume && (
              <Button
                variant="primary"
                onClick={handleGenerateDocuments}
                disabled={state.selectedSkills.length === 0 || state.isGenerating}
              >
                {state.isGenerating ? 'Generating AI Bullets...' : 'Generate AI Bullets'}
              </Button>
            )}
          </div>
        </div>

        {state.error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800 text-sm">{state.error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SkillChecklist;


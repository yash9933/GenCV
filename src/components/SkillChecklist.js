'use client';

import { useAppContext } from '../context/AppContext';
import { generateId, extractBulletPoints } from '../lib/utils';
import Button from './ui/Button';
import Checkbox from './ui/Checkbox';
import toast from 'react-hot-toast';

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
   * Handle generate documents
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
      
      const response = await fetch('/api/generate-documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobDescription: state.jobDescription,
          resumeText: state.originalResume,
          selectedSkills: state.selectedSkills,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate documents');
      }

      console.log('Documents generated successfully:', data);

             // Process the generated content
       const { suggestedSkills, newBullets, coverLetter } = data.data;

       // Update suggested skills if new ones were provided
       if (suggestedSkills && suggestedSkills.length > 0) {
         actions.setSuggestedSkills(suggestedSkills);
       }

       // Process new bullets - flatten all categories into a single array
       const allNewBullets = newBullets.flatMap(category => 
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

       // Extract original bullets from resume text
       const originalBullets = extractBulletPoints(state.originalResume);

       // Add AI bullets to the resume JSON structure
       if (allNewBullets.length > 0 && state.resumeJSON.sections) {
         // Find the Professional Experience section
         const experienceSectionIndex = state.resumeJSON.sections.findIndex(section => 
           section.title === 'Professional Experience'
         );
         
         if (experienceSectionIndex !== -1 && state.resumeJSON.sections[experienceSectionIndex].entries.length > 0) {
           // Add AI bullets to the first experience entry
           const aiBullets = allNewBullets.map(bullet => ({
             id: bullet.id,
             text: bullet.text,
             origin: 'ai',
             enabled: false
           }));
           
           actions.addAIBullets(experienceSectionIndex, 0, aiBullets);
         }
       }
       
       actions.setGeneratedBullets(allNewBullets);
       actions.setCoverLetter(coverLetter);
       actions.setCurrentStep('editor');
      
      toast.success('Documents generated successfully!');

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

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Select Skills to Highlight
          </h2>
        </div>

        <div className="mb-6">
          <p className="text-gray-600 mb-4">
            We've identified the following skills from the job description. 
            Select the ones you want to highlight in your resume:
          </p>
          
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

        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {state.selectedSkills.length} of {state.suggestedSkills.length} skills selected
          </div>
          
          <div className="space-x-4">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={state.isGenerating}
            >
              Back
            </Button>
            
            <Button
              variant="primary"
              onClick={handleGenerateDocuments}
              disabled={state.selectedSkills.length === 0 || state.isGenerating}
            >
              {state.isGenerating ? 'Generating...' : 'Generate Documents'}
            </Button>
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


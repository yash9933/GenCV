'use client';

import { AppProvider, useAppContext } from '../context/AppContext';
import { 
  ResumeInputForm, 
  SkillChecklist, 
  ResumeJSONViewer, 
  ResumeEditor 
} from '../components';

/**
 * Main Application Component
 * Orchestrates the entire resume builder flow
 */
function AppContent() {
  const { state, actions } = useAppContext();

  // Navigation handlers
  const handleStepClick = (step) => {
    // Only allow navigation to completed steps or current step
    if (step === 'input' || 
        (step === 'skills' && state.isInputSubmitted) ||
        (step === 'editor' && state.isInputSubmitted && state.resumeJSON.sections.length > 0)) {
      actions.setCurrentStep(step);
    }
  };

  // Check if steps are accessible
  const isSkillsAccessible = state.isInputSubmitted;
  const isEditorAccessible = state.isInputSubmitted && state.resumeJSON.sections.length > 0;

  // Render different components based on current step
  const renderCurrentStep = () => {
    switch (state.currentStep) {
      case 'input':
        return <ResumeInputForm />;
        
      case 'skills':
        return (
          <div className="space-y-8">
            <SkillChecklist />
          </div>
        );
        
      case 'editor':
        return <ResumeEditor />;
        
      default:
        return <ResumeInputForm />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                AI Resume Builder
              </h1>
              <p className="text-sm text-gray-600">
                Generate human-like, ATS-friendly resumes and cover letters
              </p>
            </div>
            
            {/* Progress Indicator */}
            <div className="flex items-center space-x-4">
              <div 
                className={`flex items-center space-x-2 cursor-pointer transition-colors ${
                  state.currentStep === 'input' ? 'text-blue-600' : 'text-gray-600'
                }`}
                onClick={() => handleStepClick('input')}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  state.currentStep === 'input' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  1
                </div>
                <span className="text-sm">Input</span>
              </div>
              
              <div className="w-8 h-0.5 bg-gray-300"></div>
              
              <div 
                className={`flex items-center space-x-2 cursor-pointer transition-colors ${
                  state.currentStep === 'skills' ? 'text-blue-600' : 
                  isSkillsAccessible ? 'text-gray-600 hover:text-blue-600' : 'text-gray-400'
                }`}
                onClick={() => handleStepClick('skills')}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  state.currentStep === 'skills' ? 'bg-blue-600 text-white' : 
                  state.currentStep === 'editor' ? 'bg-green-600 text-white' : 
                  isSkillsAccessible ? 'bg-gray-200 text-gray-600' : 'bg-gray-100 text-gray-400'
                }`}>
                  2
                </div>
                <span className="text-sm">Skills</span>
              </div>
              
              <div className="w-8 h-0.5 bg-gray-300"></div>
              
              <div 
                className={`flex items-center space-x-2 cursor-pointer transition-colors ${
                  state.currentStep === 'editor' ? 'text-blue-600' : 
                  isEditorAccessible ? 'text-gray-600 hover:text-blue-600' : 'text-gray-400'
                }`}
                onClick={() => handleStepClick('editor')}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  state.currentStep === 'editor' ? 'bg-blue-600 text-white' : 
                  isEditorAccessible ? 'bg-gray-200 text-gray-600' : 'bg-gray-100 text-gray-400'
                }`}>
                  3
                </div>
                <span className="text-sm">Edit</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-8">
        {renderCurrentStep()}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-sm text-gray-600">
            <p>Built with Next.js, Tailwind CSS, and AI-powered by Gemini</p>
            <p className="mt-2">
              Generate professional resumes and cover letters that stand out to ATS systems and hiring managers.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

/**
 * Main Page Component with Context Provider
 */
export default function HomePage() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

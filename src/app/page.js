'use client';

import { AppProvider, useAppContext } from '../context/AppContext';
import ResumeInputForm from '../components/ResumeInputForm';
import SkillChecklist from '../components/SkillChecklist';
import GeneratedResumeView from '../components/GeneratedResumeView';
import GeneratedCoverLetter from '../components/GeneratedCoverLetter';

/**
 * Main Application Component
 * Orchestrates the entire resume builder flow
 */
function AppContent() {
  const { state } = useAppContext();

  // Render different components based on current step
  const renderCurrentStep = () => {
    switch (state.currentStep) {
      case 'input':
        return <ResumeInputForm />;
        
      case 'skills':
        return <SkillChecklist />;
        
      case 'generated':
        return (
          <div className="space-y-8">
            <GeneratedResumeView />
            <GeneratedCoverLetter />
          </div>
        );
        
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
              <div className="flex items-center space-x-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  state.currentStep === 'input' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  1
                </div>
                <span className="text-sm text-gray-600">Input</span>
              </div>
              
              <div className="w-8 h-0.5 bg-gray-300"></div>
              
              <div className="flex items-center space-x-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  state.currentStep === 'skills' ? 'bg-blue-600 text-white' : 
                  state.currentStep === 'generated' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  2
                </div>
                <span className="text-sm text-gray-600">Skills</span>
              </div>
              
              <div className="w-8 h-0.5 bg-gray-300"></div>
              
              <div className="flex items-center space-x-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  state.currentStep === 'generated' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  3
                </div>
                <span className="text-sm text-gray-600">Generate</span>
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

'use client';

import { useState } from 'react';
import { AppProvider, useAppContext } from '../context/AppContext';
import { 
  ResumeInputForm, 
  SkillChecklist, 
  ResumeJSONViewer, 
  ResumeEditor 
} from '../components';

/**
 * Password Protection Component
 * Shows a password prompt before allowing access to the app
 */
function PasswordProtection({ onPasswordCorrect }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // For testing purposes - you can change this password
  const CORRECT_PASSWORD = 'iloveyash';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    // Simulate a small delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500));

    if (password === CORRECT_PASSWORD) {
      onPasswordCorrect();
    } else {
      setError('Incorrect password. Please try again.');
      setPassword('');
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              AI Resume Builder
            </h1>
            <p className="text-gray-600">
              Generate human-like, ATS-friendly resumes and cover letters
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Enter Password to Access
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter password..."
                required
                disabled={isSubmitting}
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || !password.trim()}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Verifying...' : 'Access Application'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              For testing purposes only. Contact administrator for access.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

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
        (step === 'editor' && state.isInputSubmitted && (
          (state.resumeJSON.experience && state.resumeJSON.experience.length > 0) ||
          (state.resumeJSON.sections && state.resumeJSON.sections.length > 0)
        ))) {
      actions.setCurrentStep(step);
    }
  };

  // Check if steps are accessible
  const isSkillsAccessible = state.isInputSubmitted;
  const isEditorAccessible = state.isInputSubmitted && (
    (state.resumeJSON.experience && state.resumeJSON.experience.length > 0) ||
    (state.resumeJSON.sections && state.resumeJSON.sections.length > 0)
  );

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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b flex-shrink-0">
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
      <main className="flex-1 py-4 px-4">
        {renderCurrentStep()}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-sm text-gray-600">
            <p>Built with ❤️ by Yash</p>
            <p className="mt-2">
              Generate professional resumes and cover letters that stand out to ATS systems and hiring managers. <br />
              Powered by Next.js, Tailwind CSS, and AI by GPT+Gemini <br />
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

/**
 * Main Page Component with Password Protection
 */
export default function HomePage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handlePasswordCorrect = () => {
    setIsAuthenticated(true);
  };

  if (!isAuthenticated) {
    return <PasswordProtection onPasswordCorrect={handlePasswordCorrect} />;
  }

  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

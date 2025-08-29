'use client';

import { useAppContext } from '../context/AppContext';
import { copyToClipboard, downloadFile, jsonToLaTeX, getFilteredJSON } from '../lib/utils';
import Button from './ui/Button';
import toast from 'react-hot-toast';

/**
 * Final Resume Preview Component
 * Displays the final resume based on the canonical JSON structure
 */

/**
 * Generated Resume View Component
 * Displays the final resume based on the canonical JSON structure
 */
const GeneratedResumeView = () => {
  const { state, actions } = useAppContext();

  /**
   * Get final resume content (only enabled bullets)
   */
  const getFinalResumeContent = () => {
    const filteredJSON = getFilteredJSON(state.resumeJSON);
    return jsonToLaTeX(filteredJSON);
  };

  /**
   * Handle back button
   */
  const handleBack = () => {
    actions.setCurrentStep('editor');
  };

  const finalResumeContent = getFinalResumeContent();

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Final Resume Preview
          </h2>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={handleBack}
            >
              Back to Editor
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                try {
                  const name = state.resumeJSON.metadata?.name || 'resume';
                  const filename = `${name.replace(/\s+/g, '_').toLowerCase()}.tex`;
                  downloadFile(finalResumeContent, filename, 'application/x-tex');
                  toast.success('LaTeX file downloaded successfully!');
                } catch (error) {
                  console.error('Error downloading LaTeX:', error);
                  toast.error('Failed to download LaTeX file');
                }
              }}
            >
              Download LaTeX
            </Button>
          </div>
        </div>

        {/* Final Resume Content */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Final Resume (LaTeX Format)
          </h3>
          <div className="bg-gray-50 p-6 rounded-lg border">
            <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono overflow-auto max-h-96">
              {finalResumeContent}
            </pre>
          </div>
        </div>

        {/* Cover Letter Section */}
        {state.coverLetter && (
          <div className="mt-8 border-t pt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Generated Cover Letter
            </h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="whitespace-pre-wrap text-sm text-gray-700 mb-4">
                {state.coverLetter}
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    copyToClipboard(state.coverLetter);
                    toast.success('Cover letter copied to clipboard');
                  }}
                >
                  Copy Cover Letter
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    downloadFile(state.coverLetter, 'cover-letter.txt', 'text/plain');
                    toast.success('Cover letter downloaded');
                  }}
                >
                  Download Cover Letter
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="mt-4 text-center text-sm text-gray-600">
          <p>💡 This is your final resume in LaTeX format. Only enabled bullets are included in the output.</p>
          <p className="mt-2">📄 You can compile the LaTeX file to generate a professional PDF resume.</p>
        </div>
      </div>
    </div>
  );
};

export default GeneratedResumeView;


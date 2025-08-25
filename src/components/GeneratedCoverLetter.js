'use client';

import { useAppContext } from '../context/AppContext';
import { copyToClipboard, downloadFile } from '../lib/utils';
import Button from './ui/Button';
import Textarea from './ui/Textarea';
import toast from 'react-hot-toast';

/**
 * Generated Cover Letter Component
 * Displays the generated cover letter with download and copy options
 */
const GeneratedCoverLetter = () => {
  const { state } = useAppContext();

  /**
   * Copy cover letter to clipboard
   */
  const handleCopyToClipboard = async () => {
    if (!state.coverLetter.trim()) {
      toast.error('No cover letter to copy');
      return;
    }

    const success = await copyToClipboard(state.coverLetter);
    
    if (success) {
      toast.success('Cover letter copied to clipboard');
    } else {
      toast.error('Failed to copy to clipboard');
    }
  };

  /**
   * Download cover letter as PDF
   */
  const handleDownloadPDF = () => {
    if (!state.coverLetter.trim()) {
      toast.error('No cover letter to download');
      return;
    }

    downloadFile(state.coverLetter, 'cover-letter.pdf', 'application/pdf');
    toast.success('Cover letter downloaded as PDF');
  };

  /**
   * Download cover letter as DOCX
   */
  const handleDownloadDOCX = () => {
    if (!state.coverLetter.trim()) {
      toast.error('No cover letter to download');
      return;
    }

    downloadFile(state.coverLetter, 'cover-letter.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    toast.success('Cover letter downloaded as DOCX');
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Generated Cover Letter
          </h2>
        </div>

        <div className="mb-6">
          <Textarea
            label="Cover Letter"
            value={state.coverLetter}
            onChange={() => {}} // Read-only
            rows={12}
            disabled
            className="bg-gray-50"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 justify-center">
          <Button
            variant="outline"
            onClick={handleCopyToClipboard}
            disabled={!state.coverLetter.trim()}
          >
            Copy to Clipboard
          </Button>
          
          <Button
            variant="primary"
            onClick={handleDownloadPDF}
            disabled={!state.coverLetter.trim()}
          >
            Download PDF
          </Button>
          
          <Button
            variant="primary"
            onClick={handleDownloadDOCX}
            disabled={!state.coverLetter.trim()}
          >
            Download DOCX
          </Button>
        </div>

        <div className="mt-4 text-center text-sm text-gray-600">
          <p>💡 Tip: The cover letter is personalized to the job description and highlights your selected skills.</p>
        </div>
      </div>
    </div>
  );
};

export default GeneratedCoverLetter;


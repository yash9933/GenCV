'use client';

import { useAppContext } from '../context/AppContext';
import { copyToClipboard, downloadFile, generateResumeContent, generateResumePreview } from '../lib/utils';
import TwoColumnLayout from './layouts/TwoColumnLayout';
import Button from './ui/Button';
import ToggleSwitch from './ui/ToggleSwitch';
import toast from 'react-hot-toast';
import { useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

/**
 * Sortable Item Component for drag and drop
 */
const SortableItem = ({ variant, onToggle }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: variant.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        p-3 border rounded-lg bg-white shadow-sm cursor-move
        ${isDragging ? 'opacity-50' : ''}
        ${variant.isEnabled ? 'border-blue-300 bg-blue-50' : 'border-gray-200'}
      `}
    >
      <div className="flex items-start space-x-3">
        <ToggleSwitch
          enabled={variant.isEnabled}
          onChange={() => onToggle(variant.bulletId, variant.id, !variant.isEnabled)}
          className="mt-1"
        />
        <div className="flex-1">
          <p className="text-sm text-gray-700 mb-1">
            {variant.text}
          </p>
          <p className="text-xs text-gray-500">
            Original: {variant.originalText}
          </p>
        </div>
      </div>
    </div>
  );
};

/**
 * Original Bullet Item Component
 */
const OriginalBulletItem = ({ bullet, onToggle }) => {
  return (
    <div className={`
      p-3 border rounded-lg bg-white shadow-sm
      ${bullet.isEnabled ? 'border-green-300 bg-green-50' : 'border-gray-200 opacity-60'}
    `}>
      <div className="flex items-start space-x-3">
        <ToggleSwitch
          enabled={bullet.isEnabled}
          onChange={() => onToggle(bullet.id, !bullet.isEnabled)}
          className="mt-1"
        />
        <div className="flex-1">
          <p className="text-sm text-gray-700">
            {bullet.text}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Original bullet
          </p>
        </div>
      </div>
    </div>
  );
};

/**
 * Sortable Generated Bullet Component
 */
const SortableGeneratedBullet = ({ bullet, onToggle }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: bullet.id,
    handle: true // Enable handle-based dragging
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`
        p-3 border rounded-lg bg-white shadow-sm
        ${isDragging ? 'opacity-50' : ''}
        ${bullet.isEnabled ? 'border-blue-300 bg-blue-50' : 'border-gray-200'}
      `}
    >
      <div className="flex items-start space-x-3">
        <div {...listeners} className="cursor-move p-1">
          <div className="w-4 h-4 bg-gray-300 rounded flex items-center justify-center">
            <div className="w-2 h-2 bg-gray-600 rounded"></div>
          </div>
        </div>
        <ToggleSwitch
          enabled={bullet.isEnabled}
          onChange={() => {
            console.log('ToggleSwitch clicked for bullet:', bullet.id, 'current state:', bullet.isEnabled);
            onToggle(bullet.id, !bullet.isEnabled);
          }}
          className="mt-1"
        />
        <div className="flex-1">
          <p className="text-sm text-gray-700 mb-1">
            {bullet.text}
          </p>
          <p className="text-xs text-gray-500">
            Category: {bullet.category || 'General'}
          </p>
        </div>
      </div>
    </div>
  );
};

/**
 * Generated Resume View Component
 * Displays original resume bullets, generated bullets, and final combined view
 */
const GeneratedResumeView = () => {
  const { state, actions } = useAppContext();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  /**
   * Handle generated bullet toggle
   */
  const handleGeneratedBulletToggle = (bulletId, isEnabled) => {
    console.log('=== TOGGLE DEBUG ===');
    console.log('Toggling generated bullet:', bulletId, 'to:', isEnabled);
    console.log('Before toggle - generated bullets:', state.generatedBullets.map(b => ({ id: b.id, isEnabled: b.isEnabled })));
    
    // Try direct state update first to test
    const updatedBullets = state.generatedBullets.map(bullet => 
      bullet.id === bulletId 
        ? { ...bullet, isEnabled }
        : bullet
    );
    console.log('Updated bullets:', updatedBullets.map(b => ({ id: b.id, isEnabled: b.isEnabled })));
    actions.setGeneratedBullets(updatedBullets);
    
    // Also try the toggle action
    console.log('Calling actions.toggleGeneratedBullet...');
    actions.toggleGeneratedBullet(bulletId, isEnabled);
    console.log('Action called, checking if it worked...');
  };

  // Monitor state changes
  useEffect(() => {
    console.log('State changed - generated bullets:', state.generatedBullets.map(b => ({ id: b.id, isEnabled: b.isEnabled })));
  }, [state.generatedBullets]);

  /**
   * Handle original bullet toggle
   */
  const handleOriginalBulletToggle = (bulletId, isEnabled) => {
    actions.toggleOriginalBullet(bulletId, isEnabled);
  };

  /**
   * Handle drag and drop
   */
  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = state.generatedBullets.findIndex(bullet => bullet.id === active.id);
      const newIndex = state.generatedBullets.findIndex(bullet => bullet.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const reorderedBullets = arrayMove(state.generatedBullets, oldIndex, newIndex);
        actions.setGeneratedBullets(reorderedBullets);
      }
    }
  };

  /**
   * Get final resume content
   */
  const getFinalResumeContent = () => {
    const enabledOriginalBullets = state.originalBullets
      .filter(bullet => bullet.isEnabled)
      .map(bullet => bullet.text);

    const enabledGeneratedBullets = state.generatedBullets
      .filter(bullet => bullet.isEnabled)
      .map(bullet => bullet.text);

    return {
      originalBullets: enabledOriginalBullets,
      generatedBullets: enabledGeneratedBullets,
      allBullets: [...enabledOriginalBullets, ...enabledGeneratedBullets]
    };
  };

  /**
   * Get formatted resume preview
   */
  const getResumePreview = () => {
    const resumeData = {
      originalResume: state.originalResume,
      originalBullets: state.originalBullets,
      generatedBullets: state.generatedBullets
    };
    return generateResumePreview(resumeData);
  };

  /**
   * Copy selected bullets to clipboard
   */
  const handleCopySelectedBullets = async () => {
    const { allBullets } = getFinalResumeContent();

    if (allBullets.length === 0) {
      toast.error('No bullets selected');
      return;
    }

    const bulletText = allBullets.join('\n\n');
    const success = await copyToClipboard(bulletText);
    
    if (success) {
      toast.success(`${allBullets.length} bullets copied to clipboard`);
    } else {
      toast.error('Failed to copy to clipboard');
    }
  };

  /**
   * Download resume as text file
   */
  const handleDownloadResume = () => {
    console.log('Downloading resume with state:', {
      originalResume: state.originalResume?.substring(0, 100) + '...',
      originalBullets: state.originalBullets,
      generatedBullets: state.generatedBullets
    });

    const resumeData = {
      originalResume: state.originalResume,
      originalBullets: state.originalBullets,
      generatedBullets: state.generatedBullets
    };

    const content = generateResumeContent(resumeData);
    downloadFile(content, 'resume.txt', 'text/plain');
    toast.success('Resume downloaded as text file');
  };

  /**
   * Handle back button
   */
  const handleBack = () => {
    actions.setCurrentStep('skills');
  };

  // For the new structure, we don't need to flatten variants
  const allGeneratedBullets = state.generatedBullets;

  const { originalBullets, generatedBullets, allBullets } = getFinalResumeContent();
  const resumePreview = getResumePreview();
  
  // Debug logging
  console.log('Current state:', {
    generatedBulletsCount: state.generatedBullets.length,
    enabledGeneratedBullets: state.generatedBullets.filter(b => b.isEnabled).length,
    allGeneratedBullets: state.generatedBullets.map(b => ({ id: b.id, text: b.text.substring(0, 50), isEnabled: b.isEnabled }))
  });

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Resume Builder
          </h2>
          <Button
            variant="outline"
            onClick={handleBack}
          >
            Back
          </Button>
        </div>

        {/* Three Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Original Bullets */}
          <div className="lg:col-span-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Original Bullets ({state.originalBullets.filter(b => b.isEnabled).length} enabled)
            </h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {state.originalBullets.map((bullet) => (
                <OriginalBulletItem
                  key={bullet.id}
                  bullet={bullet}
                  onToggle={handleOriginalBulletToggle}
                />
              ))}
            </div>
          </div>

          {/* Generated Bullets */}
          <div className="lg:col-span-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Generated Bullets ({state.generatedBullets.filter(b => b.isEnabled).length} enabled)
            </h3>
                          <div className="space-y-3 max-h-96 overflow-y-auto">
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={allGeneratedBullets.map(bullet => bullet.id)}
                    strategy={verticalListSortingStrategy}
                  >
                                         {allGeneratedBullets.map((bullet) => (
                       <SortableGeneratedBullet
                         key={bullet.id}
                         bullet={bullet}
                         onToggle={handleGeneratedBulletToggle}
                       />
                     ))}
                  </SortableContext>
                </DndContext>
              </div>
          </div>

                     {/* Final Resume Preview */}
           <div className="lg:col-span-1">
             <h3 className="text-lg font-semibold text-gray-900 mb-4">
               Final Resume ({allBullets.length} total bullets)
             </h3>
             <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
               <div className="whitespace-pre-wrap text-sm text-gray-700 font-mono">
                 {resumePreview}
               </div>
             </div>
           </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap gap-4 justify-center">
          <Button
            variant="outline"
            onClick={handleCopySelectedBullets}
          >
            Copy All Selected Bullets
          </Button>
          
          <Button
            variant="primary"
            onClick={handleDownloadResume}
          >
            Download Resume (TXT)
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
              <div className="flex justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    copyToClipboard(state.coverLetter);
                    toast.success('Cover letter copied to clipboard');
                  }}
                >
                  Copy Cover Letter
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="mt-4 text-center text-sm text-gray-600">
          <p>💡 Tip: Toggle original bullets on/off, toggle generated bullets on/off, and drag/drop generated bullets to reorder them in your final resume.</p>
          <p className="mt-2">📄 Files download as .txt format for easy editing in any text editor or word processor.</p>
        </div>
      </div>
    </div>
  );
};

export default GeneratedResumeView;


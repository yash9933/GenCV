'use client';

import { useAppContext } from '../context/AppContext';
import { copyToClipboard, downloadFile } from '../lib/utils';
import TwoColumnLayout from './layouts/TwoColumnLayout';
import Button from './ui/Button';
import ToggleSwitch from './ui/ToggleSwitch';
import toast from 'react-hot-toast';
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
  const handleGeneratedBulletToggle = (bulletId, variantId, isEnabled) => {
    actions.toggleGeneratedBullet(bulletId, variantId, isEnabled);
  };

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
      // Flatten all variants from all bullets
      const allVariants = [];
      state.generatedBullets.forEach(bullet => {
        bullet.variants.forEach(variant => {
          allVariants.push({
            ...variant,
            bulletId: bullet.id,
            originalText: bullet.original
          });
        });
      });

      const oldIndex = allVariants.findIndex(variant => variant.id === active.id);
      const newIndex = allVariants.findIndex(variant => variant.id === over.id);

      const reorderedVariants = arrayMove(allVariants, oldIndex, newIndex);

      // Reconstruct the bullets structure
      const updatedBullets = state.generatedBullets.map(bullet => ({
        ...bullet,
        variants: reorderedVariants
          .filter(variant => variant.bulletId === bullet.id)
          .map(variant => ({
            id: variant.id,
            text: variant.text,
            isEnabled: variant.isEnabled
          }))
      }));

      actions.setGeneratedBullets(updatedBullets);
    }
  };

  /**
   * Get final resume content
   */
  const getFinalResumeContent = () => {
    const enabledOriginalBullets = state.originalBullets
      .filter(bullet => bullet.isEnabled)
      .map(bullet => bullet.text);

    const enabledGeneratedBullets = state.generatedBullets.flatMap(bullet =>
      bullet.variants
        .filter(variant => variant.isEnabled)
        .map(variant => variant.text)
    );

    return {
      originalBullets: enabledOriginalBullets,
      generatedBullets: enabledGeneratedBullets,
      allBullets: [...enabledOriginalBullets, ...enabledGeneratedBullets]
    };
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
   * Download resume as PDF
   */
  const handleDownloadPDF = () => {
    const { allBullets } = getFinalResumeContent();

    const resumeContent = `
${state.originalResume}

Selected Bullets:
${allBullets.join('\n\n')}
    `;

    downloadFile(resumeContent, 'resume.pdf', 'application/pdf');
    toast.success('Resume downloaded as PDF');
  };

  /**
   * Download resume as DOCX
   */
  const handleDownloadDOCX = () => {
    const { allBullets } = getFinalResumeContent();

    const resumeContent = `
${state.originalResume}

Selected Bullets:
${allBullets.join('\n\n')}
    `;

    downloadFile(resumeContent, 'resume.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    toast.success('Resume downloaded as DOCX');
  };

  /**
   * Handle back button
   */
  const handleBack = () => {
    actions.setCurrentStep('skills');
  };

  // Flatten all variants for drag and drop
  const allVariants = state.generatedBullets.flatMap(bullet =>
    bullet.variants.map(variant => ({
      ...variant,
      bulletId: bullet.id,
      originalText: bullet.original
    }))
  );

  const { originalBullets, generatedBullets, allBullets } = getFinalResumeContent();

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
              Generated Bullets ({state.generatedBullets.flatMap(b => b.variants).filter(v => v.isEnabled).length} enabled)
            </h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={allVariants.map(variant => variant.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {allVariants.map((variant) => (
                    <SortableItem
                      key={variant.id}
                      variant={variant}
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
              <div className="space-y-2">
                {allBullets.length === 0 ? (
                  <p className="text-gray-500 italic text-sm">
                    No bullets selected. Toggle bullets above to see them here.
                  </p>
                ) : (
                  allBullets.map((bullet, index) => (
                    <div key={index} className="p-2 bg-white rounded border-l-4 border-blue-500">
                      <p className="text-sm text-gray-700">{bullet}</p>
                    </div>
                  ))
                )}
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
            onClick={handleDownloadPDF}
          >
            Download PDF
          </Button>
          
          <Button
            variant="primary"
            onClick={handleDownloadDOCX}
          >
            Download DOCX
          </Button>
        </div>

        <div className="mt-4 text-center text-sm text-gray-600">
          <p>💡 Tip: Toggle original bullets on/off, toggle generated bullets on/off, and drag/drop generated bullets to reorder them in your final resume.</p>
        </div>
      </div>
    </div>
  );
};

export default GeneratedResumeView;


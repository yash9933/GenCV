'use client';

import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { downloadLaTeX } from '../lib/utils';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
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
import ToggleSwitch from './ui/ToggleSwitch';
import Button from './ui/Button';
import Input from './ui/Input';
import toast from 'react-hot-toast';

/**
 * Section Component (No drag functionality)
 */
const Section = ({ section, sectionIndex, onReorderBullets, onToggleBullet, onEditJobTitle }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
        <div className="text-sm text-gray-500">{section.entries.length} entries</div>
      </div>
      
      {section.entries.map((entry, entryIndex) => (
        <Entry
          key={`entry-${sectionIndex}-${entryIndex}`}
          entry={entry}
          sectionIndex={sectionIndex}
          entryIndex={entryIndex}
          onReorderBullets={onReorderBullets}
          onToggleBullet={onToggleBullet}
          onEditJobTitle={onEditJobTitle}
        />
      ))}
    </div>
  );
};

/**
 * Entry Component (No drag functionality)
 */
const Entry = ({ entry, sectionIndex, entryIndex, onReorderBullets, onToggleBullet, onEditJobTitle }) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(entry.job_title || entry.name || '');

  const handleTitleSave = () => {
    if (editedTitle.trim()) {
      onEditJobTitle(sectionIndex, entryIndex, editedTitle.trim());
      setIsEditingTitle(false);
      toast.success('Job title updated');
    }
  };

  const handleTitleCancel = () => {
    setEditedTitle(entry.job_title || entry.name || '');
    setIsEditingTitle(false);
  };

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-3 hover:shadow-sm transition-shadow">
      {/* Entry Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex-1">
          {isEditingTitle ? (
            <div className="flex items-center space-x-2">
              <Input
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="flex-1"
                autoFocus
              />
              <Button size="sm" variant="primary" onClick={handleTitleSave}>
                Save
              </Button>
              <Button size="sm" variant="secondary" onClick={handleTitleCancel}>
                Cancel
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <h4 className="font-medium text-gray-900">
                {entry.job_title || entry.name || entry.degree || 'Untitled'}
              </h4>
              {(entry.job_title || entry.name) && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditingTitle(true);
                  }}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Edit
                </button>
              )}
            </div>
          )}
        </div>
        
        <div className="text-sm text-gray-500">
          {entry.company && `${entry.company}`}
          {entry.location && `, ${entry.location}`}
          {entry.date_range && ` | ${entry.date_range}`}
          {entry.date && ` | ${entry.date}`}
        </div>
      </div>

      {/* Tech Stack */}
      {entry.tech_stack && entry.tech_stack.length > 0 && (
        <div className="mb-3">
          <div className="text-sm text-gray-600 mb-1">Tech Stack:</div>
          <div className="flex flex-wrap gap-1">
            {entry.tech_stack.map((tech, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      )}

             {/* Bullets */}
       {entry.bullets && Array.isArray(entry.bullets) && entry.bullets.length > 0 && (
         <div>
           <div className="text-sm text-gray-600 mb-2">Bullet Points:</div>
           <div className="space-y-1">
             <SortableContext items={entry.bullets.map(bullet => bullet.id)} strategy={verticalListSortingStrategy}>
               {entry.bullets.map((bullet, bulletIndex) => (
                 <SortableBullet
                   key={bullet.id}
                   bullet={bullet}
                   sectionIndex={sectionIndex}
                   entryIndex={entryIndex}
                   bulletIndex={bulletIndex}
                   onToggle={onToggleBullet}
                 />
               ))}
             </SortableContext>
           </div>
         </div>
       )}
    </div>
  );
};

/**
 * Sortable Bullet Component
 */
const SortableBullet = ({ bullet, sectionIndex, entryIndex, bulletIndex, onToggle }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: bullet.id,
    transition: {
      duration: 150,
      easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleToggle = (enabled) => {
    onToggle(sectionIndex, entryIndex, bullet.id, enabled);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-start space-x-3 p-3 rounded hover:bg-gray-100 transition-all duration-150 ${
        bullet.origin === 'ai' ? 'bg-yellow-50 border-l-4 border-yellow-400' : 'bg-white border-l-4 border-gray-300'
      } ${isDragging ? 'shadow-lg scale-105' : ''}`}
    >
      {/* Toggle Switch - No drag functionality */}
      <div className="flex-shrink-0">
        <ToggleSwitch
          checked={bullet.enabled}
          onChange={handleToggle}
          className="mt-1"
        />
      </div>
      
      {/* Drag Handle - Only this area is draggable */}
      <div
        {...attributes}
        {...listeners}
        className="flex-shrink-0 w-6 h-6 flex items-center justify-center cursor-move hover:bg-gray-200 rounded"
        title="Drag to reorder"
      >
        <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M7 2a2 2 0 1 1 .001 4.001A2 2 0 0 1 7 2zm0 6a2 2 0 1 1 .001 4.001A2 2 0 0 1 7 8zm0 6a2 2 0 1 1 .001 4.001A2 2 0 0 1 7 14zm6-8a2 2 0 1 1-.001-4.001A2 2 0 0 1 13 6zm0 2a2 2 0 1 1 .001 4.001A2 2 0 0 1 13 8zm0 6a2 2 0 1 1 .001 4.001A2 2 0 0 1 13 14z" />
        </svg>
      </div>
      
      {/* Content - No drag functionality */}
      <div className="flex-1">
        <div className="flex items-center space-x-2 mb-1">
          <span className="text-gray-500">•</span>
          <span className={`text-xs px-2 py-1 rounded ${
            bullet.origin === 'ai' 
              ? 'bg-yellow-200 text-yellow-800' 
              : 'bg-gray-200 text-gray-700'
          }`}>
            {bullet.origin === 'ai' ? 'AI-generated' : 'Original'}
          </span>
        </div>
        <p className={`text-sm ${bullet.enabled ? 'text-gray-900' : 'text-gray-500 line-through'}`}>
          {bullet.text}
        </p>
      </div>
    </div>
  );
};

/**
 * Main Resume Editor Component
 */
const ResumeEditor = () => {
  const { state, actions } = useAppContext();
  const { resumeJSON } = state;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px movement before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!active || !over || active.id === over.id) {
      return;
    }

    // Handle bullet reordering only
    // Find the bullet in the JSON structure
    for (let sectionIndex = 0; sectionIndex < resumeJSON.sections.length; sectionIndex++) {
      const section = resumeJSON.sections[sectionIndex];
      for (let entryIndex = 0; entryIndex < section.entries.length; entryIndex++) {
        const entry = section.entries[entryIndex];
        
        // Check if entry has bullets property and it's an array
        if (!entry.bullets || !Array.isArray(entry.bullets)) {
          continue;
        }
        
        const bulletIndex = entry.bullets.findIndex(b => b.id === active.id);
        const overBulletIndex = entry.bullets.findIndex(b => b.id === over.id);
        
        if (bulletIndex !== -1 && overBulletIndex !== -1) {
          actions.reorderBullets(sectionIndex, entryIndex, bulletIndex, overBulletIndex);
          return;
        }
      }
    }
  };

  const handleDragStart = (event) => {
    const { active } = event;
    // You can add any drag start logic here if needed
  };

  if (!resumeJSON || !resumeJSON.sections || resumeJSON.sections.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Resume Editor
          </h2>
          <p className="text-gray-600">No resume data available. Please upload or paste your resume first.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Resume Editor
          </h2>
                     <div className="flex space-x-2">
             <Button
               variant="secondary"
               onClick={() => {
                 // Clear all storage and reset state
                 localStorage.clear();
                 sessionStorage.clear();
                 actions.clearStorage();
                 toast.success('All data cleared. Starting fresh!');
               }}
             >
               New Resume
             </Button>
             <Button
               variant="primary"
               onClick={() => {
                 try {
                   const name = resumeJSON.metadata?.name || 'resume';
                   const filename = `${name.replace(/\s+/g, '_').toLowerCase()}.tex`;
                   downloadLaTeX(resumeJSON, filename);
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

        {/* Metadata Section */}
        <div className="mb-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Contact Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-blue-800 mb-1">Name</label>
              <Input
                value={resumeJSON.metadata.name}
                onChange={(e) => {
                  const updated = { ...resumeJSON };
                  updated.metadata.name = e.target.value;
                  actions.setResumeJSON(updated);
                }}
                placeholder="Your full name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-800 mb-1">Email</label>
              <Input
                value={resumeJSON.metadata.contact.email}
                onChange={(e) => {
                  const updated = { ...resumeJSON };
                  updated.metadata.contact.email = e.target.value;
                  actions.setResumeJSON(updated);
                }}
                placeholder="your.email@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-800 mb-1">Phone</label>
              <Input
                value={resumeJSON.metadata.contact.phone}
                onChange={(e) => {
                  const updated = { ...resumeJSON };
                  updated.metadata.contact.phone = e.target.value;
                  actions.setResumeJSON(updated);
                }}
                placeholder="(123) 456-7890"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-800 mb-1">Links</label>
              <Input
                value={resumeJSON.metadata.contact.links.join(', ')}
                onChange={(e) => {
                  const updated = { ...resumeJSON };
                  updated.metadata.contact.links = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                  actions.setResumeJSON(updated);
                }}
                placeholder="LinkedIn, GitHub"
              />
            </div>
          </div>
        </div>

                 {/* Sections */}
         <DndContext
           sensors={sensors}
           collisionDetection={closestCenter}
           onDragStart={handleDragStart}
           onDragEnd={handleDragEnd}
         >
           {resumeJSON.sections.map((section, sectionIndex) => (
             <Section
               key={`section-${sectionIndex}`}
               section={section}
               sectionIndex={sectionIndex}
               onReorderBullets={actions.reorderBullets}
               onToggleBullet={actions.toggleBullet}
               onEditJobTitle={actions.editJobTitle}
             />
           ))}
         </DndContext>
      </div>
    </div>
  );
};

export default ResumeEditor;

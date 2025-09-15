'use client';

import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { downloadPDF, copyToClipboard, downloadFile } from '../lib/utils';
import Button from './ui/Button';
import Input from './ui/Input';
import Textarea from './ui/Textarea';
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
import toast from 'react-hot-toast';

/**
 * Section Component (No drag functionality)
 */
const Section = ({ section, sectionIndex, onReorderBullets, onToggleBullet, onEditJobTitle, onEditSkill, onReorderSkills }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-3 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
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
          onEditSkill={onEditSkill}
          onReorderSkills={onReorderSkills}
        />
      ))}
    </div>
  );
};

/**
 * Entry Component (No drag functionality)
 */
const Entry = ({ entry, sectionIndex, entryIndex, onReorderBullets, onToggleBullet, onEditJobTitle, onEditSkill, onReorderSkills }) => {
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
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-2 hover:shadow-sm transition-shadow">
      {/* Entry Header */}
      <div className="flex items-center justify-between mb-2">
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
                {entry.job_title || entry.name || entry.degree || entry.category || 'Untitled'}
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
        <div className="mb-2">
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

      {/* Skills */}
      {entry.skills && Array.isArray(entry.skills) && entry.skills.length > 0 && (
        <div className="mb-2">
          <div className="text-sm text-gray-600 mb-1">Skills:</div>
          <div className="space-y-1">
            <SortableContext items={entry.skills.map((_, index) => `skill-${sectionIndex}-${entryIndex}-${index}`)} strategy={verticalListSortingStrategy}>
              {entry.skills.map((skill, index) => (
                <SortableSkill
                  key={`skill-${sectionIndex}-${entryIndex}-${index}`}
                  skill={skill}
                  skillIndex={index}
                  sectionIndex={sectionIndex}
                  entryIndex={entryIndex}
                  onEditSkill={onEditSkill}
                  onReorderSkills={onReorderSkills}
                />
              ))}
            </SortableContext>
          </div>
        </div>
      )}

      {/* Bullets */}
      {entry.bullets && Array.isArray(entry.bullets) && entry.bullets.length > 0 && (
        <div>
          <div className="text-sm text-gray-600 mb-1">Bullet Points:</div>
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
      className={`flex items-start space-x-2 p-2 rounded hover:bg-gray-100 transition-all duration-150 ${
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
 * Sortable Skill Component
 */
const SortableSkill = ({ skill, skillIndex, sectionIndex, entryIndex, onEditSkill, onReorderSkills }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedSkill, setEditedSkill] = useState(skill);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: `skill-${sectionIndex}-${entryIndex}-${skillIndex}`,
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

  const handleSave = () => {
    if (editedSkill.trim()) {
      onEditSkill(sectionIndex, entryIndex, skillIndex, editedSkill.trim());
      setIsEditing(false);
      toast.success('Skill updated');
    }
  };

  const handleCancel = () => {
    setEditedSkill(skill);
    setIsEditing(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center space-x-2 p-1.5 rounded hover:bg-gray-100 transition-all duration-150 bg-green-50 border border-green-200 ${
        isDragging ? 'shadow-lg scale-105' : ''
      }`}
    >
      {/* Drag Handle - Only this area is draggable */}
      <div
        {...attributes}
        {...listeners}
        className="flex-shrink-0 w-5 h-5 flex items-center justify-center cursor-move hover:bg-green-200 rounded"
        title="Drag to reorder"
      >
        <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
          <path d="M7 2a2 2 0 1 1 .001 4.001A2 2 0 0 1 7 2zm0 6a2 2 0 1 1 .001 4.001A2 2 0 0 1 7 8zm0 6a2 2 0 1 1 .001 4.001A2 2 0 0 1 7 14zm6-8a2 2 0 1 1-.001-4.001A2 2 0 0 1 13 6zm0 2a2 2 0 1 1 .001 4.001A2 2 0 0 1 13 8zm0 6a2 2 0 1 1 .001 4.001A2 2 0 0 1 13 14z" />
        </svg>
      </div>
      
      {/* Content - Editable but not draggable */}
      <div className="flex-1">
        {isEditing ? (
          <div className="flex items-center space-x-2">
            <Input
              value={editedSkill}
              onChange={(e) => setEditedSkill(e.target.value)}
              className="flex-1 text-sm"
              autoFocus
            />
            <Button size="sm" variant="primary" onClick={handleSave}>
              Save
            </Button>
            <Button size="sm" variant="secondary" onClick={handleCancel}>
              Cancel
            </Button>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded flex-1">
              {skill}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
              }}
              className="text-green-600 hover:text-green-800 text-xs"
            >
              Edit
            </button>
          </div>
        )}
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
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isEditingCoverLetter, setIsEditingCoverLetter] = useState(false);
  const [editedCoverLetter, setEditedCoverLetter] = useState('');

  // Cover letter editing functions
  const handleEditCoverLetter = () => {
    setEditedCoverLetter(state.coverLetter || '');
    setIsEditingCoverLetter(true);
  };

  const handleSaveCoverLetter = () => {
    actions.setCoverLetter(editedCoverLetter);
    setIsEditingCoverLetter(false);
    toast.success('Cover letter updated successfully');
  };

  const handleCancelEditCoverLetter = () => {
    setEditedCoverLetter(state.coverLetter || '');
    setIsEditingCoverLetter(false);
  };

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

    // Handle bullet reordering for new schema (experience-based)
    if (resumeJSON.experience && resumeJSON.experience.length > 0) {
      for (let experienceIndex = 0; experienceIndex < resumeJSON.experience.length; experienceIndex++) {
        const experience = resumeJSON.experience[experienceIndex];
        
        // Check if experience has responsibilities property and it's an array
        if (!experience.responsibilities || !Array.isArray(experience.responsibilities)) {
          continue;
        }
        
        const bulletIndex = experience.responsibilities.findIndex(b => b.id === active.id);
        const overBulletIndex = experience.responsibilities.findIndex(b => b.id === over.id);
        
        if (bulletIndex !== -1 && overBulletIndex !== -1) {
          // Reorder bullets within the same experience entry
          const [movedBullet] = experience.responsibilities.splice(bulletIndex, 1);
          experience.responsibilities.splice(overBulletIndex, 0, movedBullet);
          
          // Update the resume JSON
          actions.setResumeJSON({ ...resumeJSON });
          return;
        }
      }
    }
    
    // Handle bullet reordering for old schema (sections-based)
    if (resumeJSON.sections && resumeJSON.sections.length > 0) {
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
    }

    // Handle skill reordering
    // Parse skill IDs to find the correct section and entry
    const activeSkillMatch = active.id.match(/^skill-(\d+)-(\d+)-(\d+)$/);
    const overSkillMatch = over.id.match(/^skill-(\d+)-(\d+)-(\d+)$/);
    
    if (activeSkillMatch && overSkillMatch) {
      const [, activeSectionIndex, activeEntryIndex, activeSkillIndex] = activeSkillMatch.map(Number);
      const [, overSectionIndex, overEntryIndex, overSkillIndex] = overSkillMatch.map(Number);
      
      // Only allow reordering within the same category (same section and entry)
      if (activeSectionIndex === overSectionIndex && activeEntryIndex === overEntryIndex) {
        actions.reorderSkills(activeSectionIndex, activeEntryIndex, activeSkillIndex, overSkillIndex);
        return;
      }
    }
  };

  const handleDragStart = (event) => {
    const { active } = event;
    // You can add any drag start logic here if needed
  };

  // Drag and drop handlers for new schema
  const handleExperienceDragEnd = (event) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = parseInt(active.id.toString().split('-')[1]);
      const newIndex = parseInt(over.id.toString().split('-')[1]);
      actions.reorderExperience(oldIndex, newIndex);
    }
  };

  const handleEducationDragEnd = (event) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = parseInt(active.id.toString().split('-')[1]);
      const newIndex = parseInt(over.id.toString().split('-')[1]);
      actions.reorderEducation(oldIndex, newIndex);
    }
  };

  const handleProjectsDragEnd = (event) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = parseInt(active.id.toString().split('-')[1]);
      const newIndex = parseInt(over.id.toString().split('-')[1]);
      actions.reorderProjects(oldIndex, newIndex);
    }
  };

  // Handle PDF export for new schema
  const handleExportPDF = async () => {
    try {
      setIsExporting(true);
      
      // Debug: Check resumeJSON before PDF generation
      console.log('handleExportPDF: resumeJSON:', resumeJSON);
      console.log('handleExportPDF: resumeJSON type:', typeof resumeJSON);
      console.log('handleExportPDF: resumeJSON keys:', resumeJSON ? Object.keys(resumeJSON) : 'null/undefined');
      
      if (!resumeJSON) {
        throw new Error('No resume data available for PDF generation');
      }
      
      const baseName = (resumeJSON.name || 'Resume')
        .toString()
        .trim()
        .replace(/[\\\/:*?"<>|]+/g, '') // remove illegal filename chars
        .replace(/\s+/g, ' '); // keep spaces
      const filename = `${baseName}.pdf`;
      await downloadPDF(resumeJSON, filename);
      toast.success('PDF file downloaded successfully!');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error('Failed to generate PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  // Check if we have any meaningful resume data (either old schema with sections or new schema with experience/education)
  const hasOldSchema = resumeJSON?.sections && resumeJSON.sections.length > 0;
  const hasNewSchema = resumeJSON?.experience || resumeJSON?.education || resumeJSON?.technical_skills;
  const hasBasicInfo = resumeJSON?.name;
  
  if (!resumeJSON || (!hasOldSchema && !hasNewSchema && !hasBasicInfo)) {
    return (
      <div className="max-w-7xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Resume Editor
          </h2>
          <p className="text-gray-600">No resume data available. Please upload or paste your resume first.</p>
        </div>
      </div>
    );
  }

  // If using new schema, show the full editor
  if (resumeJSON.experience && resumeJSON.experience.length > 0) {
    return (
      <>
        <div className="max-w-7xl mx-auto p-4">
          <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Resume Editor</h2>
            <div className="flex space-x-4">
              <Button
                variant="secondary"
                onClick={async () => {
                  try {
                    // Clear web storage
                    localStorage.clear();
                    sessionStorage.clear();
                    // Clear Cache Storage
                    if (window.caches && caches.keys) {
                      const keys = await caches.keys();
                      await Promise.all(keys.map((key) => caches.delete(key)));
                    }
                  } catch (_) {}
                  // Reset app state and go to input
                  actions.clearStorage();
                  actions.setCurrentStep('input');
                  toast.success('Starting a new application');
                }}
              >
                Start New
              </Button>
              <Button
                variant="outline"
                onClick={() => actions.setCurrentStep('skills')}
              >
                Back to Skills
              </Button>
              <Button
                variant="primary"
                onClick={handleExportPDF}
                disabled={isExporting}
              >
                {isExporting ? 'Exporting...' : 'Export PDF'}
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            {/* Contact Information */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <Input
                    value={resumeJSON.name || ''}
                    onChange={(e) => {
                      const updated = { ...resumeJSON };
                      updated.name = e.target.value;
                      actions.setResumeJSON(updated);
                    }}
                    placeholder="Full Name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <Input
                    value={resumeJSON.contact?.phone || ''}
                    onChange={(e) => actions.updateContact('phone', e.target.value)}
                    placeholder="Phone Number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <Input
                    value={resumeJSON.contact?.email || ''}
                    onChange={(e) => actions.updateContact('email', e.target.value)}
                    placeholder="Email Address"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
                  <Input
                    value={resumeJSON.contact?.linkedin || ''}
                    onChange={(e) => actions.updateContact('linkedin', e.target.value)}
                    placeholder="LinkedIn URL"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Portfolio</label>
                  <Input
                    value={resumeJSON.contact?.portfolio || ''}
                    onChange={(e) => actions.updateContact('portfolio', e.target.value)}
                    placeholder="Portfolio URL"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">GitHub</label>
                  <Input
                    value={resumeJSON.contact?.github || ''}
                    onChange={(e) => actions.updateContact('github', e.target.value)}
                    placeholder="GitHub URL"
                  />
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Professional Summary</h3>
              <Textarea
                value={resumeJSON.summary || ''}
                onChange={(e) => actions.updateSummary(e.target.value)}
                placeholder="Write your professional summary..."
                rows={4}
              />
            </div>

            {/* Experience */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-800">Professional Experience</h3>
                <Button
                  variant="outline"
                  size="sm"
                    onClick={() => actions.addExperience({
                      title: '',
                      company: '',
                      location: '',
                      dates: '',
                      responsibilities: [],
                      tech_stack: []
                    })}
                >
                  Add Experience
                </Button>
              </div>
              
              <DndContext onDragEnd={handleExperienceDragEnd}>
                <SortableContext items={resumeJSON.experience.map((_, index) => `exp-${index}`)}>
                  {resumeJSON.experience.map((job, index) => (
                    <ExperienceWithBullets
                      key={`exp-${index}`}
                      job={job}
                      index={index}
                      onUpdate={(updatedJob) => actions.updateExperience(index, updatedJob)}
                      onDelete={() => actions.deleteExperience(index)}
                      onToggleBullet={(bulletIndex, enabled) => actions.toggleExperienceBullet(index, bulletIndex, enabled)}
                      onUpdateBullet={(bulletIndex, newText) => actions.updateExperienceBullet(index, bulletIndex, newText)}
                      onReorderBullets={(fromIndex, toIndex) => actions.reorderExperienceBullets(index, fromIndex, toIndex)}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            </div>

            {/* Education */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-800">Education</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => actions.addEducation({
                    degree: '',
                    institution: '',
                    location: '',
                    graduation_date: ''
                  })}
                >
                  Add Education
                </Button>
              </div>
              
              <DndContext onDragEnd={handleEducationDragEnd}>
                <SortableContext items={resumeJSON.education.map((_, index) => `edu-${index}`)}>
                  {resumeJSON.education.map((edu, index) => (
                    <EducationEditor
                      key={`edu-${index}`}
                      education={edu}
                      index={index}
                      onUpdate={(updatedEdu) => actions.updateEducation(index, updatedEdu)}
                      onDelete={() => actions.deleteEducation(index)}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            </div>

            {/* Technical Skills */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Technical Skills</h3>
              <SkillsEditor
                skills={resumeJSON.technical_skills}
                onUpdate={(category, skills) => actions.updateSkills(category, skills)}
              />
            </div>

            {/* Projects */}
            {resumeJSON.projects && resumeJSON.projects.length > 0 && (
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-800">Projects</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => actions.addProject({
                      name: '',
                      url: '',
                      technologies: [],
                      bullets: []
                    })}
                  >
                    Add Project
                  </Button>
                </div>
                
                <DndContext onDragEnd={handleProjectsDragEnd}>
                  <SortableContext items={resumeJSON.projects.map((_, index) => `proj-${index}`)}>
                    {resumeJSON.projects.map((project, index) => (
                      <ProjectEditor
                        key={`proj-${index}`}
                        project={project}
                        index={index}
                        onUpdate={(updatedProject) => actions.updateProject(index, updatedProject)}
                        onDelete={() => actions.deleteProject(index)}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              </div>
            )}

            {/* Certifications */}
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Certifications</h3>
              <CertificationsEditor
                certifications={resumeJSON.certifications || []}
                onUpdate={(certs) => actions.updateCertifications(certs)}
              />
            </div>

            {/* Volunteer */}
            {(resumeJSON.volunteer?.title || resumeJSON.volunteer?.organization) && (
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Volunteer Experience</h3>
                <VolunteerEditor
                  volunteer={resumeJSON.volunteer}
                  onUpdate={(volunteer) => actions.updateVolunteer(volunteer)}
                />
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Cover Letter Section - Separate Container */}
      {state.coverLetter && state.coverLetter.trim() && (
        <div className="max-w-7xl mx-auto p-4 mt-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Generated Cover Letter</h2>
              <div className="flex space-x-2">
                {isEditingCoverLetter ? (
                  <>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleSaveCoverLetter}
                    >
                      Save
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleCancelEditCoverLetter}
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleEditCoverLetter}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
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
                      }}
                    >
                      Copy
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        if (!state.coverLetter.trim()) {
                          toast.error('No cover letter to download');
                          return;
                        }
                        downloadFile(state.coverLetter, 'cover-letter.pdf', 'application/pdf');
                        toast.success('Cover letter downloaded as PDF');
                      }}
                    >
                      Download PDF
                    </Button>
                  </>
                )}
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4">
              <Textarea
                value={isEditingCoverLetter ? editedCoverLetter : state.coverLetter}
                onChange={isEditingCoverLetter ? (e) => setEditedCoverLetter(e.target.value) : () => {}}
                rows={12}
                disabled={!isEditingCoverLetter}
                className={`${isEditingCoverLetter ? 'bg-white border border-gray-300' : 'bg-white border-0'} resize-none`}
              />
            </div>
            
            <div className="mt-3 text-center text-sm text-gray-600">
              <p>💡 Tip: The cover letter is personalized to the job description and highlights your selected skills.</p>
            </div>
          </div>
        </div>
      )}
      </>
    );
  }

  return (
    <>
      <div className="max-w-7xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
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
                 actions.setCurrentStep('input');
                 toast.success('All data cleared. Starting fresh!');
               }}
             >
               New Resume
             </Button>

              <Button
                variant="primary"
                disabled={isGeneratingPDF}
                onClick={async () => {
                  try {
                    setIsGeneratingPDF(true);
                    const baseName = (resumeJSON.name || 'Resume')
                      .toString()
                      .trim()
                      .replace(/[\\\/:*?"<>|]+/g, '')
                      .replace(/\s+/g, ' ');
                    const filename = `${baseName}.pdf`;
                    await downloadPDF(resumeJSON, filename);
                    toast.success('PDF file downloaded successfully!');
                  } catch (error) {
                    console.error('Error downloading PDF:', error);
                    toast.error('Failed to generate PDF. Please try again.');
                  } finally {
                    setIsGeneratingPDF(false);
                  }
                }}
              >
                {isGeneratingPDF ? 'Generating PDF...' : 'Download PDF'}
              </Button>
           </div>
        </div>

        {/* Metadata Section */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Contact Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-blue-800 mb-1">Name</label>
              <Input
                value={resumeJSON.name || ''}
                onChange={(e) => {
                  const updated = { ...resumeJSON };
                  updated.name = e.target.value;
                  actions.setResumeJSON(updated);
                }}
                placeholder="Your full name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-800 mb-1">Email</label>
              <Input
                value={resumeJSON.contact?.email || ''}
                onChange={(e) => {
                  const updated = { ...resumeJSON };
                  if (!updated.contact) updated.contact = {};
                  updated.contact.email = e.target.value;
                  actions.setResumeJSON(updated);
                }}
                placeholder="your.email@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-800 mb-1">Phone</label>
              <Input
                value={resumeJSON.contact?.phone || ''}
                onChange={(e) => {
                  const updated = { ...resumeJSON };
                  if (!updated.contact) updated.contact = {};
                  updated.contact.phone = e.target.value;
                  actions.setResumeJSON(updated);
                }}
                placeholder="(123) 456-7890"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-800 mb-1">Links</label>
              <Input
                value={resumeJSON.contact?.linkedin || ''}
                onChange={(e) => {
                  const updated = { ...resumeJSON };
                  if (!updated.contact) updated.contact = {};
                  updated.contact.linkedin = e.target.value;
                  actions.setResumeJSON(updated);
                }}
                placeholder="LinkedIn URL"
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
                       {resumeJSON.sections && resumeJSON.sections.length > 0 ? resumeJSON.sections.map((section, sectionIndex) => (
              <Section
                key={`section-${sectionIndex}`}
                section={section}
                sectionIndex={sectionIndex}
                onReorderBullets={actions.reorderBullets}
                onToggleBullet={actions.toggleBullet}
                onEditJobTitle={actions.editJobTitle}
                onEditSkill={actions.editSkill}
                onReorderSkills={actions.reorderSkills}
              />
            )) : (
              <div className="text-center text-gray-500 py-8">
                <p>No resume sections found. Please check if the resume was parsed correctly.</p>
              </div>
            )}
         </DndContext>

      </div>
    </div>

    {/* Cover Letter Section - Separate Container */}
    {state.coverLetter && state.coverLetter.trim() && (
      <div className="max-w-7xl mx-auto p-4 mt-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Generated Cover Letter</h2>
            <div className="flex space-x-2">
              {isEditingCoverLetter ? (
                <>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleSaveCoverLetter}
                  >
                    Save
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleCancelEditCoverLetter}
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleEditCoverLetter}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
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
                    }}
                  >
                    Copy
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      if (!state.coverLetter.trim()) {
                        toast.error('No cover letter to download');
                        return;
                      }
                      downloadFile(state.coverLetter, 'cover-letter.pdf', 'application/pdf');
                      toast.success('Cover letter downloaded as PDF');
                    }}
                  >
                    Download PDF
                  </Button>
                </>
              )}
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <Textarea
              value={isEditingCoverLetter ? editedCoverLetter : state.coverLetter}
              onChange={isEditingCoverLetter ? (e) => setEditedCoverLetter(e.target.value) : () => {}}
              rows={12}
              disabled={!isEditingCoverLetter}
              className={`${isEditingCoverLetter ? 'bg-white border border-gray-300' : 'bg-white border-0'} resize-none`}
            />
          </div>
          
          <div className="mt-3 text-center text-sm text-gray-600">
            <p>💡 Tip: The cover letter is personalized to the job description and highlights your selected skills.</p>
          </div>
        </div>
      </div>
    )}
    </>
  );
};

// Experience Editor Component
const ExperienceEditor = ({ job, index, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedJob, setEditedJob] = useState(job);

  const handleSave = () => {
    onUpdate(editedJob);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedJob(job);
    setIsEditing(false);
  };

  const addResponsibility = () => {
    setEditedJob({
      ...editedJob,
      responsibilities: [...editedJob.responsibilities, '']
    });
  };

  const updateResponsibility = (index, value) => {
    const newResponsibilities = [...editedJob.responsibilities];
    newResponsibilities[index] = value;
    setEditedJob({
      ...editedJob,
      responsibilities: newResponsibilities
    });
  };

  const removeResponsibility = (index) => {
    const newResponsibilities = editedJob.responsibilities.filter((_, i) => i !== index);
    setEditedJob({
      ...editedJob,
      responsibilities: newResponsibilities
    });
  };

  return (
    <div className="border border-gray-200 rounded-lg p-3 mb-3">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-semibold text-gray-900">Experience #{index + 1}</h4>
        <div className="flex space-x-2">
          {isEditing ? (
            <>
              <Button variant="outline" size="sm" onClick={handleSave}>
                Save
              </Button>
              <Button variant="outline" size="sm" onClick={handleCancel}>
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                Edit
              </Button>
              <Button variant="outline" size="sm" onClick={onDelete}>
                Delete
              </Button>
            </>
          )}
        </div>
      </div>

      {isEditing ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
              <Input
                value={editedJob.title}
                onChange={(e) => setEditedJob({ ...editedJob, title: e.target.value })}
                placeholder="Job Title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
              <Input
                value={editedJob.company}
                onChange={(e) => setEditedJob({ ...editedJob, company: e.target.value })}
                placeholder="Company Name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <Input
                value={editedJob.location}
                onChange={(e) => setEditedJob({ ...editedJob, location: e.target.value })}
                placeholder="City, State"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dates</label>
              <Input
                value={editedJob.dates}
                onChange={(e) => setEditedJob({ ...editedJob, dates: e.target.value })}
                placeholder="MMM YYYY - MMM YYYY"
              />
            </div>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">Responsibilities</label>
              <Button variant="outline" size="sm" onClick={addResponsibility}>
                Add Responsibility
              </Button>
            </div>
            {editedJob.responsibilities.map((responsibility, respIndex) => (
              <div key={respIndex} className="flex items-center space-x-2 mb-2">
                <Textarea
                  value={responsibility}
                  onChange={(e) => updateResponsibility(respIndex, e.target.value)}
                  placeholder="Describe your responsibility..."
                  rows={2}
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeResponsibility(respIndex)}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <div className="flex justify-between items-start mb-2">
            <div>
              <h5 className="font-semibold text-gray-900">{job.title}</h5>
              <p className="text-gray-600">{job.company} - {job.location}</p>
            </div>
            <span className="text-sm text-gray-500">{job.dates}</span>
          </div>
          <ul className="list-disc list-inside space-y-1">
            {job.responsibilities.map((responsibility, respIndex) => (
              <li key={respIndex} className="text-sm text-gray-700">{responsibility}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// Education Editor Component
const EducationEditor = ({ education, index, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedEducation, setEditedEducation] = useState(education);

  const handleSave = () => {
    // Filter out empty fields on save
    const filteredEducation = {
      ...editedEducation,
      degree: editedEducation.degree?.trim() || '',
      institution: editedEducation.institution?.trim() || '',
      graduation_date: editedEducation.graduation_date?.trim() || '',
      location: editedEducation.location?.trim() || '',
      gpa: editedEducation.gpa?.trim() || ''
    };
    onUpdate(filteredEducation);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedEducation(education);
    setIsEditing(false);
  };

  return (
    <div className="border border-gray-200 rounded-lg p-3 mb-3">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-semibold text-gray-900">Education #{index + 1}</h4>
        <div className="flex space-x-2">
          {isEditing ? (
            <>
              <Button variant="outline" size="sm" onClick={handleSave}>
                Save
              </Button>
              <Button variant="outline" size="sm" onClick={handleCancel}>
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                Edit
              </Button>
              <Button variant="outline" size="sm" onClick={onDelete}>
                Delete
              </Button>
            </>
          )}
        </div>
      </div>

      {isEditing ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Degree</label>
            <Input
              value={editedEducation.degree}
              onChange={(e) => setEditedEducation({ ...editedEducation, degree: e.target.value })}
              placeholder="Degree Name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Institution</label>
            <Input
              value={editedEducation.institution}
              onChange={(e) => setEditedEducation({ ...editedEducation, institution: e.target.value })}
              placeholder="University Name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <Input
              value={editedEducation.location}
              onChange={(e) => setEditedEducation({ ...editedEducation, location: e.target.value })}
              placeholder="City, State"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Graduation Date</label>
            <Input
              value={editedEducation.graduation_date}
              onChange={(e) => setEditedEducation({ ...editedEducation, graduation_date: e.target.value })}
              placeholder="MMM YYYY"
            />
          </div>
        </div>
      ) : (
        <div>
          <h5 className="font-semibold text-gray-900">{education.degree}</h5>
          <p className="text-gray-600">{education.institution} - {education.location}</p>
          <p className="text-sm text-gray-500">{education.graduation_date}</p>
        </div>
      )}
    </div>
  );
};

// Skills Editor Component
const SkillsEditor = ({ skills, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedSkills, setEditedSkills] = useState(skills);

  const handleSave = () => {
    Object.keys(editedSkills).forEach(category => {
      // Filter out empty skills on save
      const filteredSkills = Array.isArray(editedSkills[category]) 
        ? editedSkills[category].filter(skill => skill.trim() !== '')
        : editedSkills[category];
      onUpdate(category, filteredSkills);
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedSkills(skills);
    setIsEditing(false);
  };

  const updateSkillCategory = (category, newSkills) => {
    setEditedSkills({
      ...editedSkills,
      [category]: newSkills
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-gray-900">Technical Skills</h4>
        <div className="flex space-x-2">
          {isEditing ? (
            <>
              <Button variant="outline" size="sm" onClick={handleSave}>
                Save
              </Button>
              <Button variant="outline" size="sm" onClick={handleCancel}>
                Cancel
              </Button>
            </>
          ) : (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              Edit
            </Button>
          )}
        </div>
      </div>

      {isEditing ? (
        <div className="space-y-4">
          {Object.entries(editedSkills).map(([category, skillList]) => (
            <div key={category} className="border border-gray-200 rounded-lg p-4">
              <h5 className="font-medium text-gray-800 mb-2 capitalize">
                {category.replace(/_/g, ' ')}
              </h5>
              <Textarea
                value={skillList.join(', ')}
                onChange={(e) => updateSkillCategory(category, e.target.value.split(',').map(s => s.trim()).filter(s => s))}
                placeholder="Enter skills separated by commas"
                rows={2}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {Object.entries(skills).map(([category, skillList]) => {
            const filteredSkills = Array.isArray(skillList) ? skillList.filter(skill => skill.trim() !== '') : [];
            return filteredSkills.length > 0 && (
              <div key={category}>
                <h5 className="font-medium text-gray-800 capitalize">
                  {category.replace(/_/g, ' ')}
                </h5>
                <p className="text-sm text-gray-600">{filteredSkills.join(', ')}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// Certifications Editor Component
const CertificationsEditor = ({ certifications, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedCerts, setEditedCerts] = useState(certifications.join(', '));

  const handleSave = () => {
    const certsArray = editedCerts.split(',').map(cert => cert.trim()).filter(cert => cert);
    onUpdate(certsArray);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedCerts(certifications.join(', '));
    setIsEditing(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-gray-900">Certifications</h4>
        <div className="flex space-x-2">
          {isEditing ? (
            <>
              <Button variant="outline" size="sm" onClick={handleSave}>
                Save
              </Button>
              <Button variant="outline" size="sm" onClick={handleCancel}>
                Cancel
              </Button>
            </>
          ) : (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              Edit
            </Button>
          )}
        </div>
      </div>

      {isEditing ? (
        <Textarea
          value={editedCerts}
          onChange={(e) => setEditedCerts(e.target.value)}
          placeholder="Enter certifications separated by commas"
          rows={3}
        />
      ) : (
        <div className="flex flex-wrap gap-2">
          {certifications.map((cert, index) => (
            <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
              {cert}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

// Volunteer Editor Component
const VolunteerEditor = ({ volunteer, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedVolunteer, setEditedVolunteer] = useState(volunteer);

  const handleSave = () => {
    onUpdate(editedVolunteer);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedVolunteer(volunteer);
    setIsEditing(false);
  };

  const addResponsibility = () => {
    setEditedVolunteer({
      ...editedVolunteer,
      responsibilities: [...editedVolunteer.responsibilities, '']
    });
  };

  const updateResponsibility = (index, value) => {
    const newResponsibilities = [...editedVolunteer.responsibilities];
    newResponsibilities[index] = value;
    setEditedVolunteer({
      ...editedVolunteer,
      responsibilities: newResponsibilities
    });
  };

  const removeResponsibility = (index) => {
    const newResponsibilities = editedVolunteer.responsibilities.filter((_, i) => i !== index);
    setEditedVolunteer({
      ...editedVolunteer,
      responsibilities: newResponsibilities
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-gray-900">Volunteer Experience</h4>
        <div className="flex space-x-2">
          {isEditing ? (
            <>
              <Button variant="outline" size="sm" onClick={handleSave}>
                Save
              </Button>
              <Button variant="outline" size="sm" onClick={handleCancel}>
                Cancel
              </Button>
            </>
          ) : (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              Edit
            </Button>
          )}
        </div>
      </div>

      {isEditing ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <Input
                value={editedVolunteer.title}
                onChange={(e) => setEditedVolunteer({ ...editedVolunteer, title: e.target.value })}
                placeholder="Volunteer Title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Organization</label>
              <Input
                value={editedVolunteer.organization}
                onChange={(e) => setEditedVolunteer({ ...editedVolunteer, organization: e.target.value })}
                placeholder="Organization Name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dates</label>
              <Input
                value={editedVolunteer.dates}
                onChange={(e) => setEditedVolunteer({ ...editedVolunteer, dates: e.target.value })}
                placeholder="MMM YYYY - MMM YYYY"
              />
            </div>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">Responsibilities</label>
              <Button variant="outline" size="sm" onClick={addResponsibility}>
                Add Responsibility
              </Button>
            </div>
            {editedVolunteer.responsibilities.map((responsibility, respIndex) => (
              <div key={respIndex} className="flex items-center space-x-2 mb-2">
                <Textarea
                  value={responsibility}
                  onChange={(e) => updateResponsibility(respIndex, e.target.value)}
                  placeholder="Describe your responsibility..."
                  rows={2}
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeResponsibility(respIndex)}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <div className="flex justify-between items-start mb-2">
            <div>
              <h5 className="font-semibold text-gray-900">{volunteer.title}</h5>
              <p className="text-gray-600">{volunteer.organization}</p>
            </div>
            <span className="text-sm text-gray-500">{volunteer.dates}</span>
          </div>
          <ul className="list-disc list-inside space-y-1">
            {volunteer.responsibilities.map((responsibility, respIndex) => (
              <li key={respIndex} className="text-sm text-gray-700">{responsibility}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// Experience with Bullets Component
const ExperienceWithBullets = ({ 
  job, 
  index, 
  onUpdate, 
  onDelete, 
  onToggleBullet, 
  onUpdateBullet, 
  onReorderBullets 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedJob, setEditedJob] = useState(job);

  const handleSave = () => {
    // Filter out empty responsibilities and tech stack on save
    const filteredJob = {
      ...editedJob,
      title: editedJob.title?.trim() || '',
      company: editedJob.company?.trim() || '',
      dates: editedJob.dates?.trim() || '',
      location: editedJob.location?.trim() || '',
      responsibilities: (editedJob.responsibilities || []).filter(resp => {
        if (typeof resp === 'string') {
          return resp.trim() !== '';
        }
        return resp.text && resp.text.trim() !== '';
      }),
      tech_stack: (editedJob.tech_stack || []).filter(tech => tech.trim() !== '')
    };
    onUpdate(filteredJob);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedJob(job);
    setIsEditing(false);
  };

  const addResponsibility = () => {
    setEditedJob({
      ...editedJob,
      responsibilities: [...(editedJob.responsibilities || []), '']
    });
  };

  // Simplified: tech stack is edited as a single comma-separated text box

  const handleBulletDragEnd = (event) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = parseInt(active.id.toString().split('-')[1]);
      const newIndex = parseInt(over.id.toString().split('-')[1]);
      onReorderBullets(oldIndex, newIndex);
    }
  };

  // Normalize responsibilities to handle both string and object formats
  const normalizeResponsibilities = (responsibilities) => {
    if (!responsibilities) return [];
    return responsibilities.map((resp, idx) => {
      if (typeof resp === 'string') {
        return {
          text: resp,
          enabled: true,
          origin: 'original'
        };
      }
      return {
        text: resp.text || resp,
        enabled: resp.enabled !== undefined ? resp.enabled : true,
        origin: resp.origin || 'original',
        category: resp.category
      };
    });
  };

  const normalizedResponsibilities = normalizeResponsibilities(job.responsibilities);

  return (
    <div className="border border-gray-200 rounded-lg p-3 mb-3">
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-semibold text-gray-900">Experience #{index + 1}</h4>
        <div className="flex space-x-2">
          {isEditing ? (
            <>
              <Button variant="outline" size="sm" onClick={handleSave}>
                Save
              </Button>
              <Button variant="outline" size="sm" onClick={handleCancel}>
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                Edit
              </Button>
              <Button variant="outline" size="sm" onClick={onDelete}>
                Delete
              </Button>
            </>
          )}
        </div>
      </div>

      {isEditing ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
              <Input
                value={editedJob.title}
                onChange={(e) => setEditedJob({ ...editedJob, title: e.target.value })}
                placeholder="Job Title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
              <Input
                value={editedJob.company}
                onChange={(e) => setEditedJob({ ...editedJob, company: e.target.value })}
                placeholder="Company Name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <Input
                value={editedJob.location}
                onChange={(e) => setEditedJob({ ...editedJob, location: e.target.value })}
                placeholder="City, State"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dates</label>
              <Input
                value={editedJob.dates}
                onChange={(e) => setEditedJob({ ...editedJob, dates: e.target.value })}
                placeholder="MMM YYYY - MMM YYYY"
              />
            </div>
          </div>
          
          {/* Responsibilities Section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">Responsibilities</label>
              <Button variant="outline" size="sm" onClick={addResponsibility}>
                Add Responsibility
              </Button>
            </div>
            {editedJob.responsibilities.map((responsibility, respIndex) => (
              <div key={respIndex} className="flex items-center space-x-2 mb-2">
                <Textarea
                  value={responsibility}
                  onChange={(e) => {
                    const newResponsibilities = [...editedJob.responsibilities];
                    newResponsibilities[respIndex] = e.target.value;
                    setEditedJob({ ...editedJob, responsibilities: newResponsibilities });
                  }}
                  placeholder="Responsibility description..."
                  rows={2}
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newResponsibilities = editedJob.responsibilities.filter((_, i) => i !== respIndex);
                    setEditedJob({ ...editedJob, responsibilities: newResponsibilities });
                  }}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
          
          {/* Tech Stack Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tech Stack</label>
            <Textarea
              value={(editedJob.tech_stack || []).join(', ')}
              onChange={(e) => {
                const parsed = e.target.value
                  .split(/[,;\n]/)
                  .map(s => s.trim())
                  .filter(Boolean);
                setEditedJob({ ...editedJob, tech_stack: parsed });
              }}
              placeholder="Comma-separated technologies (e.g., React, Node.js, AWS)"
              rows={2}
            />
          </div>
        </div>
      ) : (
        <div>
          <div className="flex justify-between items-start mb-4">
            <div>
              <h5 className="font-semibold text-gray-900">{job.title}</h5>
              <p className="text-gray-600">{job.company} - {job.location}</p>
            </div>
            <span className="text-sm text-gray-500">{job.dates}</span>
          </div>
          
          {/* Bullet Management */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h6 className="font-medium text-gray-800">Responsibilities</h6>
            </div>
            
            <DndContext onDragEnd={handleBulletDragEnd}>
              <SortableContext items={normalizedResponsibilities.map((_, idx) => `bullet-${idx}`)}>
                {normalizedResponsibilities.map((bullet, bulletIndex) => (
                  <BulletItem
                    key={`bullet-${bulletIndex}`}
                    bullet={bullet}
                    bulletIndex={bulletIndex}
                    onToggle={(enabled) => onToggleBullet(bulletIndex, enabled)}
                    onUpdate={(newText) => onUpdateBullet(bulletIndex, newText)}
                  />
                ))}
              </SortableContext>
            </DndContext>
          </div>
          
          {/* Tech Stack Display */}
          {job.tech_stack && job.tech_stack.filter(tech => tech.trim() !== '').length > 0 && (
            <div className="mt-3">
              <div className="text-sm text-gray-600 mb-1">Tech Stack:</div>
              <div className="flex flex-wrap gap-1">
                {job.tech_stack.filter(tech => tech.trim() !== '').map((tech, techIndex) => (
                  <span
                    key={techIndex}
                    className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Bullet Item Component
const BulletItem = ({ bullet, bulletIndex, onToggle, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(bullet.text);

  const handleSave = () => {
    onUpdate(editedText);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedText(bullet.text);
    setIsEditing(false);
  };

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `bullet-${bulletIndex}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-start space-x-2 p-2 border rounded-lg ${
        bullet.enabled ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-200 opacity-60'
      }`}
    >
      <div className="flex items-center space-x-2">
        <ToggleSwitch
          checked={bullet.enabled}
          onChange={(checked) => onToggle(checked)}
        />
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab text-gray-400 hover:text-gray-600"
        >
          ⋮⋮
        </div>
      </div>
      
      <div className="flex-1">
        {isEditing ? (
          <div className="space-y-2">
            <Textarea
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              rows={2}
              className="w-full"
            />
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={handleSave}>
                Save
              </Button>
              <Button variant="outline" size="sm" onClick={handleCancel}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-start justify-between">
            <p className={`text-sm ${bullet.enabled ? 'text-gray-700' : 'text-gray-500'}`}>
              {bullet.text}
            </p>
            <div className="flex space-x-1 ml-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="text-xs"
              >
                Edit
              </Button>
            </div>
          </div>
        )}
        
        {/* Show origin and category badges */}
        <div className="flex space-x-2 mt-2">
          <span className={`px-2 py-1 text-xs rounded ${
            bullet.origin === 'ai' 
              ? 'bg-blue-100 text-blue-800' 
              : bullet.origin === 'user'
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800'
          }`}>
            {bullet.origin === 'ai' ? 'AI Generated' : bullet.origin === 'user' ? 'User Added' : 'Original'}
          </span>
          {bullet.category && (
            <span className="px-2 py-1 text-xs rounded bg-purple-100 text-purple-800">
              {bullet.category}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// Project Editor Component
const ProjectEditor = ({ project, index, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedProject, setEditedProject] = useState(project);

  const handleSave = () => {
    // Filter out empty values on save
    const filteredProject = {
      ...editedProject,
      name: editedProject.name?.trim() || '',
      url: editedProject.url?.trim() || '',
      technologies: (editedProject.technologies || []).filter(tech => tech.trim() !== ''),
      bullets: (editedProject.bullets || []).filter(bullet => bullet.trim() !== '')
    };
    onUpdate(filteredProject);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedProject(project);
    setIsEditing(false);
  };

  // Simplified: technologies edited as a single comma-separated text box

  const addBullet = () => {
    setEditedProject({
      ...editedProject,
      bullets: [...(editedProject.bullets || []), '']
    });
  };

  const updateBullet = (bulletIndex, value) => {
    const newBullets = [...(editedProject.bullets || [])];
    newBullets[bulletIndex] = value;
    setEditedProject({
      ...editedProject,
      bullets: newBullets
    });
  };

  const removeBullet = (bulletIndex) => {
    const newBullets = (editedProject.bullets || []).filter((_, i) => i !== bulletIndex);
    setEditedProject({
      ...editedProject,
      bullets: newBullets
    });
  };

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: `proj-${index}`,
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="border border-gray-200 rounded-lg p-3 mb-3"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <div
            {...attributes}
            {...listeners}
            className="cursor-move text-gray-400 hover:text-gray-600"
          >
            ⋮⋮
          </div>
          <h4 className="font-semibold text-gray-900">Project #{index + 1}</h4>
        </div>
        <div className="flex space-x-2">
          {isEditing ? (
            <>
              <Button variant="outline" size="sm" onClick={handleSave}>
                Save
              </Button>
              <Button variant="outline" size="sm" onClick={handleCancel}>
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                Edit
              </Button>
              <Button variant="outline" size="sm" onClick={onDelete}>
                Delete
              </Button>
            </>
          )}
        </div>
      </div>

      {isEditing ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
            <Input
              value={editedProject.name}
              onChange={(e) => setEditedProject({ ...editedProject, name: e.target.value })}
              placeholder="Project Name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Project URL (Optional)</label>
            <Input
              value={editedProject.url || ''}
              onChange={(e) => setEditedProject({ ...editedProject, url: e.target.value })}
              placeholder="https://project-url.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Technologies</label>
            <Textarea
              value={(editedProject.technologies || []).join(', ')}
              onChange={(e) => {
                const parsed = e.target.value
                  .split(/[,;\n]/)
                  .map(s => s.trim())
                  .filter(Boolean);
                setEditedProject({ ...editedProject, technologies: parsed });
              }}
              placeholder="Comma-separated technologies (e.g., React, Node.js, AWS)"
              rows={2}
            />
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">Bullet Points</label>
              <Button variant="outline" size="sm" onClick={addBullet}>
                Add Bullet
              </Button>
            </div>
            {(editedProject.bullets || []).map((bullet, bulletIndex) => (
              <div key={bulletIndex} className="flex items-center space-x-2 mb-2">
                <Textarea
                  value={bullet}
                  onChange={(e) => updateBullet(bulletIndex, e.target.value)}
                  placeholder="Bullet point description..."
                  rows={2}
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeBullet(bulletIndex)}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <div className="mb-2">
            {project.url && project.url.trim() ? (
              <a 
                href={project.url.startsWith('http') ? project.url : `https://${project.url}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-blue-600 hover:text-blue-800 underline"
              >
                {project.name}
              </a>
            ) : (
              <span className="font-semibold text-gray-900">{project.name}</span>
            )}
            {project.technologies && project.technologies.filter(tech => tech.trim() !== '').length > 0 && (
              <span className="font-normal text-gray-600">
                {' | Tech Stack: '}
                {project.technologies.filter(tech => tech.trim() !== '').join(', ')}
              </span>
            )}
          </div>
          {project.bullets && project.bullets.length > 0 && (
            <div>
              <div className="text-sm text-gray-600 mb-1">Key Points:</div>
              <ul className="list-disc list-inside space-y-1">
                {project.bullets.map((bullet, bulletIndex) => (
                  <li key={bulletIndex} className="text-sm text-gray-700">{bullet}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ResumeEditor;

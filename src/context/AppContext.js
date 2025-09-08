'use client';

import { createContext, useContext, useReducer, useEffect } from 'react';

// Initial state with new canonical JSON structure
const initialState = {
  // Form data
  jobDescription: '',
  originalResume: '',
  resumeJSON: {
    name: '',
    contact: {
      phone: '',
      email: '',
      linkedin: ''
    },
    certifications: [],
    summary: '',
    experience: [],
    technical_skills: {
      project_program_management: [],
      business_analysis_documentation: [],
      data_reporting_tools: [],
      collaboration_communication: [],
      testing_quality_assurance: []
    },
    volunteer: {
      title: '',
      organization: '',
      dates: '',
      responsibilities: []
    },
    education: [],
    projects: []
  },
  
  // Skills
  suggestedSkills: [],
  selectedSkills: [],
  
  // Generated content
  generatedBullets: [],
  coverLetter: '',
  
  // UI state
  isInputSubmitted: false,
  isGenerating: false,
  currentStep: 'input', // 'input', 'skills', 'generated'
  
  // Error handling
  error: null
};

// Action types
const ACTIONS = {
  SET_JOB_DESCRIPTION: 'SET_JOB_DESCRIPTION',
  SET_ORIGINAL_RESUME: 'SET_ORIGINAL_RESUME',
  SET_RESUME_JSON: 'SET_RESUME_JSON',
  SET_SUGGESTED_SKILLS: 'SET_SUGGESTED_SKILLS',
  SET_SELECTED_SKILLS: 'SET_SELECTED_SKILLS',
  SET_GENERATED_BULLETS: 'SET_GENERATED_BULLETS',
  SET_COVER_LETTER: 'SET_COVER_LETTER',
  SET_INPUT_SUBMITTED: 'SET_INPUT_SUBMITTED',
  SET_GENERATING: 'SET_GENERATING',
  SET_CURRENT_STEP: 'SET_CURRENT_STEP',
  SET_ERROR: 'SET_ERROR',
  RESET_STATE: 'RESET_STATE',
  TOGGLE_BULLET: 'TOGGLE_BULLET',
  REORDER_BULLETS: 'REORDER_BULLETS',
  REORDER_ENTRIES: 'REORDER_ENTRIES',
  REORDER_SECTIONS: 'REORDER_SECTIONS',
  EDIT_JOB_TITLE: 'EDIT_JOB_TITLE',
  EDIT_SKILL: 'EDIT_SKILL',
  REORDER_SKILLS: 'REORDER_SKILLS',
  ADD_AI_BULLETS: 'ADD_AI_BULLETS',
  LOAD_FROM_STORAGE: 'LOAD_FROM_STORAGE',
  SAVE_TO_STORAGE: 'SAVE_TO_STORAGE',
  // New schema editing actions
  UPDATE_EXPERIENCE: 'UPDATE_EXPERIENCE',
  UPDATE_EDUCATION: 'UPDATE_EDUCATION',
  UPDATE_SKILLS: 'UPDATE_SKILLS',
  UPDATE_CONTACT: 'UPDATE_CONTACT',
  UPDATE_SUMMARY: 'UPDATE_SUMMARY',
  UPDATE_CERTIFICATIONS: 'UPDATE_CERTIFICATIONS',
  UPDATE_VOLUNTEER: 'UPDATE_VOLUNTEER',
  REORDER_EXPERIENCE: 'REORDER_EXPERIENCE',
  REORDER_EDUCATION: 'REORDER_EDUCATION',
  DELETE_EXPERIENCE: 'DELETE_EXPERIENCE',
  DELETE_EDUCATION: 'DELETE_EDUCATION',
  ADD_EXPERIENCE: 'ADD_EXPERIENCE',
  ADD_EDUCATION: 'ADD_EDUCATION',
  // Project actions
  UPDATE_PROJECT: 'UPDATE_PROJECT',
  REORDER_PROJECTS: 'REORDER_PROJECTS',
  DELETE_PROJECT: 'DELETE_PROJECT',
  ADD_PROJECT: 'ADD_PROJECT',
  // Bullet management actions for new schema
  TOGGLE_EXPERIENCE_BULLET: 'TOGGLE_EXPERIENCE_BULLET',
  ADD_EXPERIENCE_BULLET: 'ADD_EXPERIENCE_BULLET',
  REMOVE_EXPERIENCE_BULLET: 'REMOVE_EXPERIENCE_BULLET',
  REORDER_EXPERIENCE_BULLETS: 'REORDER_EXPERIENCE_BULLETS',
  UPDATE_EXPERIENCE_BULLET: 'UPDATE_EXPERIENCE_BULLET'
};

// Reducer function
function appReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_JOB_DESCRIPTION:
      return { ...state, jobDescription: action.payload };
      
    case ACTIONS.SET_ORIGINAL_RESUME:
      return { ...state, originalResume: action.payload };
      
    case ACTIONS.SET_RESUME_JSON:
      return { ...state, resumeJSON: action.payload };
      
    case ACTIONS.SET_SUGGESTED_SKILLS:
      return { ...state, suggestedSkills: action.payload };
      
    case ACTIONS.SET_SELECTED_SKILLS:
      return { ...state, selectedSkills: action.payload };
      
    case ACTIONS.SET_GENERATED_BULLETS:
      return { ...state, generatedBullets: action.payload };
      
    case ACTIONS.SET_COVER_LETTER:
      return { ...state, coverLetter: action.payload };
      
    case ACTIONS.SET_INPUT_SUBMITTED:
      return { ...state, isInputSubmitted: action.payload };
      
    case ACTIONS.SET_GENERATING:
      return { ...state, isGenerating: action.payload };
      
    case ACTIONS.SET_CURRENT_STEP:
      return { ...state, currentStep: action.payload };
      
    case ACTIONS.SET_ERROR:
      return { ...state, error: action.payload };
      
    case ACTIONS.RESET_STATE:
      return initialState;
      
    case ACTIONS.TOGGLE_BULLET:
      const { sectionIndex, entryIndex, bulletId, enabled } = action.payload;
      const updatedResumeJSON = { ...state.resumeJSON };
      const section = updatedResumeJSON.sections[sectionIndex];
      const entry = section.entries[entryIndex];
      const bullet = entry.bullets.find(b => b.id === bulletId);
      if (bullet) {
        bullet.enabled = enabled;
      }
      return { ...state, resumeJSON: updatedResumeJSON };
      
    case ACTIONS.REORDER_BULLETS:
      const { sectionIdx, entryIdx, sourceIndex, destinationIndex } = action.payload;
      const reorderedResumeJSON = { ...state.resumeJSON };
      const reorderSection = reorderedResumeJSON.sections[sectionIdx];
      const reorderEntry = reorderSection.entries[entryIdx];
      const [movedBullet] = reorderEntry.bullets.splice(sourceIndex, 1);
      reorderEntry.bullets.splice(destinationIndex, 0, movedBullet);
      return { ...state, resumeJSON: reorderedResumeJSON };
      
    case ACTIONS.REORDER_ENTRIES:
      const { sectionIndex: secIdx, sourceIndex: srcIdx, destinationIndex: destIdx } = action.payload;
      const reorderedEntriesJSON = { ...state.resumeJSON };
      const reorderEntriesSection = reorderedEntriesJSON.sections[secIdx];
      const [movedEntry] = reorderEntriesSection.entries.splice(srcIdx, 1);
      reorderEntriesSection.entries.splice(destIdx, 0, movedEntry);
      return { ...state, resumeJSON: reorderedEntriesJSON };
      
    case ACTIONS.REORDER_SECTIONS:
      const { sourceIndex: srcSecIdx, destinationIndex: destSecIdx } = action.payload;
      const reorderedSectionsJSON = { ...state.resumeJSON };
      const [movedSection] = reorderedSectionsJSON.sections.splice(srcSecIdx, 1);
      reorderedSectionsJSON.sections.splice(destSecIdx, 0, movedSection);
      return { ...state, resumeJSON: reorderedSectionsJSON };
      
    case ACTIONS.EDIT_JOB_TITLE:
      const { sectionIndex: editSecIdx, entryIndex: editEntryIdx, newTitle } = action.payload;
      const editedResumeJSON = { ...state.resumeJSON };
      const editSection = editedResumeJSON.sections[editSecIdx];
      const editEntry = editSection.entries[editEntryIdx];
      if (editEntry.job_title !== undefined) {
        editEntry.job_title = newTitle;
      }
      return { ...state, resumeJSON: editedResumeJSON };
      
    case ACTIONS.EDIT_SKILL:
      const { sectionIndex: skillSecIdx, entryIndex: skillEntryIdx, skillIndex, newSkill } = action.payload;
      const skillEditedResumeJSON = { ...state.resumeJSON };
      const skillEditSection = skillEditedResumeJSON.sections[skillSecIdx];
      const skillEditEntry = skillEditSection.entries[skillEntryIdx];
      if (skillEditEntry.skills && skillEditEntry.skills[skillIndex] !== undefined) {
        skillEditEntry.skills[skillIndex] = newSkill;
      }
      return { ...state, resumeJSON: skillEditedResumeJSON };
      
    case ACTIONS.REORDER_SKILLS:
      const { sectionIndex: skillReorderSecIdx, entryIndex: skillReorderEntryIdx, sourceIndex: skillSrcIdx, destinationIndex: skillDestIdx } = action.payload;
      const skillReorderedResumeJSON = { ...state.resumeJSON };
      const skillReorderSection = skillReorderedResumeJSON.sections[skillReorderSecIdx];
      const skillReorderEntry = skillReorderSection.entries[skillReorderEntryIdx];
      const [movedSkill] = skillReorderEntry.skills.splice(skillSrcIdx, 1);
      skillReorderEntry.skills.splice(skillDestIdx, 0, movedSkill);
      return { ...state, resumeJSON: skillReorderedResumeJSON };
      
    case ACTIONS.ADD_AI_BULLETS:
      const { sectionIndex: aiSecIdx, entryIndex: aiEntryIdx, aiBullets } = action.payload;
      const aiUpdatedResumeJSON = { ...state.resumeJSON };
      const aiSection = aiUpdatedResumeJSON.sections[aiSecIdx];
      const aiEntry = aiSection.entries[aiEntryIdx];
      
      // Check for existing bullet IDs to avoid duplicates
      const existingIds = new Set(aiEntry.bullets.map(b => b.id));
      
      aiBullets.forEach(bullet => {
        // Only add if the ID doesn't already exist
        if (!existingIds.has(bullet.id)) {
          aiEntry.bullets.push({
            id: bullet.id,
            text: bullet.text,
            origin: 'ai',
            enabled: false
          });
          existingIds.add(bullet.id); // Add to set to prevent duplicates within this batch
        }
      });
      return { ...state, resumeJSON: aiUpdatedResumeJSON };
      
    case ACTIONS.LOAD_FROM_STORAGE:
      return { ...state, ...action.payload };
      
    case ACTIONS.SAVE_TO_STORAGE:
      // This action doesn't change state, just triggers localStorage save
      return state;
      
    // New schema editing actions
    case ACTIONS.UPDATE_EXPERIENCE:
      const { experienceIndex, updatedExperience } = action.payload;
      const updatedExpResumeJSON = { ...state.resumeJSON };
      if (updatedExpResumeJSON.experience && updatedExpResumeJSON.experience[experienceIndex]) {
        // Only filter out empty responsibilities on save, not during editing
        const filteredExperience = {
          ...updatedExperience,
          responsibilities: (updatedExperience.responsibilities || []).filter(resp => {
            if (typeof resp === 'string') {
              return resp.trim() !== '';
            }
            return resp.text && resp.text.trim() !== '';
          })
        };
        updatedExpResumeJSON.experience[experienceIndex] = filteredExperience;
      }
      return { ...state, resumeJSON: updatedExpResumeJSON };
      
    case ACTIONS.UPDATE_EDUCATION:
      const { educationIndex, updatedEducation } = action.payload;
      const updatedEduResumeJSON = { ...state.resumeJSON };
      if (updatedEduResumeJSON.education && updatedEduResumeJSON.education[educationIndex]) {
        // Filter out empty fields
        const filteredEducation = {
          ...updatedEducation,
          degree: updatedEducation.degree?.trim() || '',
          school: updatedEducation.school?.trim() || '',
          dates: updatedEducation.dates?.trim() || '',
          gpa: updatedEducation.gpa?.trim() || '',
          location: updatedEducation.location?.trim() || ''
        };
        updatedEduResumeJSON.education[educationIndex] = filteredEducation;
      }
      return { ...state, resumeJSON: updatedEduResumeJSON };
      
    case ACTIONS.UPDATE_SKILLS:
      const { skillCategory, updatedSkills } = action.payload;
      const updatedSkillsResumeJSON = { ...state.resumeJSON };
      if (updatedSkillsResumeJSON.technical_skills) {
        // Filter out empty skills
        const filteredSkills = Array.isArray(updatedSkills) 
          ? updatedSkills.filter(skill => skill.trim() !== '')
          : updatedSkills;
        updatedSkillsResumeJSON.technical_skills[skillCategory] = filteredSkills;
      }
      return { ...state, resumeJSON: updatedSkillsResumeJSON };
      
    case ACTIONS.UPDATE_CONTACT:
      const { contactField, contactValue } = action.payload;
      const updatedContactResumeJSON = { ...state.resumeJSON };
      if (updatedContactResumeJSON.contact) {
        // Filter out empty contact values
        updatedContactResumeJSON.contact[contactField] = contactValue?.trim() || '';
      }
      return { ...state, resumeJSON: updatedContactResumeJSON };
      
    case ACTIONS.UPDATE_SUMMARY:
      const updatedSummaryResumeJSON = { ...state.resumeJSON };
      updatedSummaryResumeJSON.summary = action.payload?.trim() || '';
      return { ...state, resumeJSON: updatedSummaryResumeJSON };
      
    case ACTIONS.UPDATE_CERTIFICATIONS:
      const updatedCertResumeJSON = { ...state.resumeJSON };
      // Filter out empty certifications
      const filteredCertifications = Array.isArray(action.payload) 
        ? action.payload.filter(cert => cert.trim() !== '')
        : action.payload;
      updatedCertResumeJSON.certifications = filteredCertifications;
      return { ...state, resumeJSON: updatedCertResumeJSON };
      
    case ACTIONS.UPDATE_VOLUNTEER:
      const updatedVolunteerResumeJSON = { ...state.resumeJSON };
      // Filter out empty volunteer fields
      const filteredVolunteer = {
        ...action.payload,
        title: action.payload.title?.trim() || '',
        organization: action.payload.organization?.trim() || '',
        dates: action.payload.dates?.trim() || '',
        responsibilities: (action.payload.responsibilities || []).filter(resp => resp.trim() !== '')
      };
      updatedVolunteerResumeJSON.volunteer = filteredVolunteer;
      return { ...state, resumeJSON: updatedVolunteerResumeJSON };
      
    case ACTIONS.REORDER_EXPERIENCE:
      const { fromIndex, toIndex } = action.payload;
      const reorderedExpResumeJSON = { ...state.resumeJSON };
      if (reorderedExpResumeJSON.experience) {
        const [movedExperience] = reorderedExpResumeJSON.experience.splice(fromIndex, 1);
        reorderedExpResumeJSON.experience.splice(toIndex, 0, movedExperience);
      }
      return { ...state, resumeJSON: reorderedExpResumeJSON };
      
    case ACTIONS.REORDER_EDUCATION:
      const { fromIndex: eduFromIndex, toIndex: eduToIndex } = action.payload;
      const reorderedEduResumeJSON = { ...state.resumeJSON };
      if (reorderedEduResumeJSON.education) {
        const [movedEducation] = reorderedEduResumeJSON.education.splice(eduFromIndex, 1);
        reorderedEduResumeJSON.education.splice(eduToIndex, 0, movedEducation);
      }
      return { ...state, resumeJSON: reorderedEduResumeJSON };
      
    case ACTIONS.DELETE_EXPERIENCE:
      const { deleteExpIndex } = action.payload;
      const deletedExpResumeJSON = { ...state.resumeJSON };
      if (deletedExpResumeJSON.experience && deletedExpResumeJSON.experience[deleteExpIndex]) {
        deletedExpResumeJSON.experience.splice(deleteExpIndex, 1);
      }
      return { ...state, resumeJSON: deletedExpResumeJSON };
      
    case ACTIONS.DELETE_EDUCATION:
      const { deleteEduIndex } = action.payload;
      const deletedEduResumeJSON = { ...state.resumeJSON };
      if (deletedEduResumeJSON.education && deletedEduResumeJSON.education[deleteEduIndex]) {
        deletedEduResumeJSON.education.splice(deleteEduIndex, 1);
      }
      return { ...state, resumeJSON: deletedEduResumeJSON };
      
    case ACTIONS.ADD_EXPERIENCE:
      const newExperience = action.payload;
      const addedExpResumeJSON = { ...state.resumeJSON };
      if (!addedExpResumeJSON.experience) {
        addedExpResumeJSON.experience = [];
      }
      addedExpResumeJSON.experience.push(newExperience);
      return { ...state, resumeJSON: addedExpResumeJSON };
      
    case ACTIONS.ADD_EDUCATION:
      const newEducation = action.payload;
      const addedEduResumeJSON = { ...state.resumeJSON };
      if (!addedEduResumeJSON.education) {
        addedEduResumeJSON.education = [];
      }
      addedEduResumeJSON.education.push(newEducation);
      return { ...state, resumeJSON: addedEduResumeJSON };
      
    // Project actions
    case ACTIONS.UPDATE_PROJECT:
      const { projectIndex, updatedProject } = action.payload;
      const updatedProjResumeJSON = { ...state.resumeJSON };
      if (updatedProjResumeJSON.projects && updatedProjResumeJSON.projects[projectIndex]) {
        // Filter out empty project fields
        const filteredProject = {
          ...updatedProject,
          name: updatedProject.name?.trim() || '',
          description: updatedProject.description?.trim() || '',
          technologies: (updatedProject.technologies || []).filter(tech => tech.trim() !== ''),
          bullets: (updatedProject.bullets || []).filter(bullet => bullet.trim() !== '')
        };
        updatedProjResumeJSON.projects[projectIndex] = filteredProject;
      }
      return { ...state, resumeJSON: updatedProjResumeJSON };
      
    case ACTIONS.REORDER_PROJECTS:
      const { fromIndex: projFromIndex, toIndex: projToIndex } = action.payload;
      const reorderedProjResumeJSON = { ...state.resumeJSON };
      if (reorderedProjResumeJSON.projects) {
        const [movedProject] = reorderedProjResumeJSON.projects.splice(projFromIndex, 1);
        reorderedProjResumeJSON.projects.splice(projToIndex, 0, movedProject);
      }
      return { ...state, resumeJSON: reorderedProjResumeJSON };
      
    case ACTIONS.DELETE_PROJECT:
      const { deleteProjIndex } = action.payload;
      const deletedProjResumeJSON = { ...state.resumeJSON };
      if (deletedProjResumeJSON.projects && deletedProjResumeJSON.projects[deleteProjIndex]) {
        deletedProjResumeJSON.projects.splice(deleteProjIndex, 1);
      }
      return { ...state, resumeJSON: deletedProjResumeJSON };
      
    case ACTIONS.ADD_PROJECT:
      const newProject = action.payload;
      const addedProjResumeJSON = { ...state.resumeJSON };
      if (!addedProjResumeJSON.projects) {
        addedProjResumeJSON.projects = [];
      }
      addedProjResumeJSON.projects.push(newProject);
      return { ...state, resumeJSON: addedProjResumeJSON };
      
    // Bullet management actions for new schema
    case ACTIONS.TOGGLE_EXPERIENCE_BULLET:
      const { expIndex, bulletIndex, enabled: bulletEnabled } = action.payload;
      const toggledExpResumeJSON = { ...state.resumeJSON };
      if (toggledExpResumeJSON.experience && toggledExpResumeJSON.experience[expIndex]) {
        const job = toggledExpResumeJSON.experience[expIndex];
        if (job.responsibilities && job.responsibilities[bulletIndex]) {
          // For new schema, we'll add an enabled property to track bullet state
          if (job.responsibilities[bulletIndex].enabled === undefined) {
            job.responsibilities[bulletIndex] = {
              text: job.responsibilities[bulletIndex],
              enabled: bulletEnabled
            };
          } else {
            job.responsibilities[bulletIndex].enabled = bulletEnabled;
          }
        }
      }
      return { ...state, resumeJSON: toggledExpResumeJSON };
      
    case ACTIONS.ADD_EXPERIENCE_BULLET:
      const { expIndex: addExpIndex, bulletText } = action.payload;
      const addedBulletResumeJSON = { ...state.resumeJSON };
      if (addedBulletResumeJSON.experience && addedBulletResumeJSON.experience[addExpIndex]) {
        const job = addedBulletResumeJSON.experience[addExpIndex];
        if (!job.responsibilities) {
          job.responsibilities = [];
        }
        job.responsibilities.push({
          text: bulletText,
          enabled: true,
          origin: 'user'
        });
      }
      return { ...state, resumeJSON: addedBulletResumeJSON };
      
    case ACTIONS.REMOVE_EXPERIENCE_BULLET:
      const { expIndex: removeExpIndex, bulletIndex: removeBulletIndex } = action.payload;
      const removedBulletResumeJSON = { ...state.resumeJSON };
      if (removedBulletResumeJSON.experience && removedBulletResumeJSON.experience[removeExpIndex]) {
        const job = removedBulletResumeJSON.experience[removeExpIndex];
        if (job.responsibilities && job.responsibilities[removeBulletIndex]) {
          job.responsibilities.splice(removeBulletIndex, 1);
        }
      }
      return { ...state, resumeJSON: removedBulletResumeJSON };
      
    case ACTIONS.REORDER_EXPERIENCE_BULLETS:
      const { expIndex: reorderExpIndex, fromIndex: bulletFromIndex, toIndex: bulletToIndex } = action.payload;
      const reorderedBulletsResumeJSON = { ...state.resumeJSON };
      if (reorderedBulletsResumeJSON.experience && reorderedBulletsResumeJSON.experience[reorderExpIndex]) {
        const job = reorderedBulletsResumeJSON.experience[reorderExpIndex];
        if (job.responsibilities) {
          const [movedBullet] = job.responsibilities.splice(bulletFromIndex, 1);
          job.responsibilities.splice(bulletToIndex, 0, movedBullet);
        }
      }
      return { ...state, resumeJSON: reorderedBulletsResumeJSON };
      
    case ACTIONS.UPDATE_EXPERIENCE_BULLET:
      const { expIndex: updateExpIndex, bulletIndex: updateBulletIndex, newText } = action.payload;
      const updatedBulletResumeJSON = { ...state.resumeJSON };
      if (updatedBulletResumeJSON.experience && updatedBulletResumeJSON.experience[updateExpIndex]) {
        const job = updatedBulletResumeJSON.experience[updateExpIndex];
        if (job.responsibilities && job.responsibilities[updateBulletIndex]) {
          // Filter out empty bullets
          if (newText.trim() === '') {
            job.responsibilities = job.responsibilities.filter((_, index) => index !== updateBulletIndex);
          } else {
            if (typeof job.responsibilities[updateBulletIndex] === 'string') {
              job.responsibilities[updateBulletIndex] = {
                text: newText.trim(),
                enabled: true,
                origin: 'user'
              };
            } else {
              job.responsibilities[updateBulletIndex].text = newText.trim();
            }
          }
        }
      }
      return { ...state, resumeJSON: updatedBulletResumeJSON };
      
    default:
      return state;
  }
}

// Create context
const AppContext = createContext();

// Provider component
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const savedState = localStorage.getItem('resumeBuilderState');
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        dispatch({ type: ACTIONS.LOAD_FROM_STORAGE, payload: parsedState });
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
    }
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem('resumeBuilderState', JSON.stringify(state));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }, [state]);

  // Action creators
  const actions = {
    setJobDescription: (description) => 
      dispatch({ type: ACTIONS.SET_JOB_DESCRIPTION, payload: description }),
      
    setOriginalResume: (resume) => 
      dispatch({ type: ACTIONS.SET_ORIGINAL_RESUME, payload: resume }),
      
    setResumeJSON: (resumeJSON) => 
      dispatch({ type: ACTIONS.SET_RESUME_JSON, payload: resumeJSON }),
      
    setSuggestedSkills: (skills) => 
      dispatch({ type: ACTIONS.SET_SUGGESTED_SKILLS, payload: skills }),
      
    setSelectedSkills: (skills) => 
      dispatch({ type: ACTIONS.SET_SELECTED_SKILLS, payload: skills }),
      
    setGeneratedBullets: (bullets) => 
      dispatch({ type: ACTIONS.SET_GENERATED_BULLETS, payload: bullets }),
      
    setCoverLetter: (letter) => 
      dispatch({ type: ACTIONS.SET_COVER_LETTER, payload: letter }),
      
    setInputSubmitted: (submitted) => 
      dispatch({ type: ACTIONS.SET_INPUT_SUBMITTED, payload: submitted }),
      
    setGenerating: (generating) => 
      dispatch({ type: ACTIONS.SET_GENERATING, payload: generating }),
      
    setCurrentStep: (step) => 
      dispatch({ type: ACTIONS.SET_CURRENT_STEP, payload: step }),
      
    setError: (error) => 
      dispatch({ type: ACTIONS.SET_ERROR, payload: error }),
      
    resetState: () => 
      dispatch({ type: ACTIONS.RESET_STATE }),
      
    toggleBullet: (sectionIndex, entryIndex, bulletId, enabled) => 
      dispatch({ 
        type: ACTIONS.TOGGLE_BULLET, 
        payload: { sectionIndex, entryIndex, bulletId, enabled } 
      }),
      
    reorderBullets: (sectionIndex, entryIndex, sourceIndex, destinationIndex) => 
      dispatch({ 
        type: ACTIONS.REORDER_BULLETS, 
        payload: { sectionIdx: sectionIndex, entryIdx: entryIndex, sourceIndex, destinationIndex } 
      }),
      
    reorderEntries: (sectionIndex, sourceIndex, destinationIndex) => 
      dispatch({ 
        type: ACTIONS.REORDER_ENTRIES, 
        payload: { sectionIndex, sourceIndex, destinationIndex } 
      }),
      
    reorderSections: (sourceIndex, destinationIndex) => 
      dispatch({ 
        type: ACTIONS.REORDER_SECTIONS, 
        payload: { sourceIndex, destinationIndex } 
      }),
      
    editJobTitle: (sectionIndex, entryIndex, newTitle) => 
      dispatch({ 
        type: ACTIONS.EDIT_JOB_TITLE, 
        payload: { sectionIndex, entryIndex, newTitle } 
      }),
      
    editSkill: (sectionIndex, entryIndex, skillIndex, newSkill) => 
      dispatch({ 
        type: ACTIONS.EDIT_SKILL, 
        payload: { sectionIndex, entryIndex, skillIndex, newSkill } 
      }),
      
    reorderSkills: (sectionIndex, entryIndex, sourceIndex, destinationIndex) => 
      dispatch({ 
        type: ACTIONS.REORDER_SKILLS, 
        payload: { sectionIndex, entryIndex, sourceIndex, destinationIndex } 
      }),
      
    addAIBullets: (sectionIndex, entryIndex, aiBullets) => 
      dispatch({ 
        type: ACTIONS.ADD_AI_BULLETS, 
        payload: { sectionIndex, entryIndex, aiBullets } 
      }),
      
    // New schema editing action creators
    updateExperience: (experienceIndex, updatedExperience) =>
      dispatch({
        type: ACTIONS.UPDATE_EXPERIENCE,
        payload: { experienceIndex, updatedExperience }
      }),
      
    updateEducation: (educationIndex, updatedEducation) =>
      dispatch({
        type: ACTIONS.UPDATE_EDUCATION,
        payload: { educationIndex, updatedEducation }
      }),
      
    updateSkills: (skillCategory, updatedSkills) =>
      dispatch({
        type: ACTIONS.UPDATE_SKILLS,
        payload: { skillCategory, updatedSkills }
      }),
      
    updateContact: (contactField, contactValue) =>
      dispatch({
        type: ACTIONS.UPDATE_CONTACT,
        payload: { contactField, contactValue }
      }),
      
    updateSummary: (summary) =>
      dispatch({
        type: ACTIONS.UPDATE_SUMMARY,
        payload: summary
      }),
      
    updateCertifications: (certifications) =>
      dispatch({
        type: ACTIONS.UPDATE_CERTIFICATIONS,
        payload: certifications
      }),
      
    updateVolunteer: (volunteer) =>
      dispatch({
        type: ACTIONS.UPDATE_VOLUNTEER,
        payload: volunteer
      }),
      
    reorderExperience: (fromIndex, toIndex) =>
      dispatch({
        type: ACTIONS.REORDER_EXPERIENCE,
        payload: { fromIndex, toIndex }
      }),
      
    reorderEducation: (fromIndex, toIndex) =>
      dispatch({
        type: ACTIONS.REORDER_EDUCATION,
        payload: { fromIndex, toIndex }
      }),
      
    deleteExperience: (experienceIndex) =>
      dispatch({
        type: ACTIONS.DELETE_EXPERIENCE,
        payload: { deleteExpIndex: experienceIndex }
      }),
      
    deleteEducation: (educationIndex) =>
      dispatch({
        type: ACTIONS.DELETE_EDUCATION,
        payload: { deleteEduIndex: educationIndex }
      }),
      
    addExperience: (newExperience) =>
      dispatch({
        type: ACTIONS.ADD_EXPERIENCE,
        payload: newExperience
      }),
      
    addEducation: (newEducation) =>
      dispatch({
        type: ACTIONS.ADD_EDUCATION,
        payload: newEducation
      }),
      
    // Project action creators
    updateProject: (projectIndex, updatedProject) =>
      dispatch({
        type: ACTIONS.UPDATE_PROJECT,
        payload: { projectIndex, updatedProject }
      }),
      
    reorderProjects: (fromIndex, toIndex) =>
      dispatch({
        type: ACTIONS.REORDER_PROJECTS,
        payload: { fromIndex, toIndex }
      }),
      
    deleteProject: (projectIndex) =>
      dispatch({
        type: ACTIONS.DELETE_PROJECT,
        payload: { deleteProjIndex: projectIndex }
      }),
      
    addProject: (newProject) =>
      dispatch({
        type: ACTIONS.ADD_PROJECT,
        payload: newProject
      }),
      
    // Bullet management action creators for new schema
    toggleExperienceBullet: (expIndex, bulletIndex, enabled) =>
      dispatch({
        type: ACTIONS.TOGGLE_EXPERIENCE_BULLET,
        payload: { expIndex, bulletIndex, enabled }
      }),
      
    addExperienceBullet: (expIndex, bulletText) =>
      dispatch({
        type: ACTIONS.ADD_EXPERIENCE_BULLET,
        payload: { expIndex, bulletText }
      }),
      
    removeExperienceBullet: (expIndex, bulletIndex) =>
      dispatch({
        type: ACTIONS.REMOVE_EXPERIENCE_BULLET,
        payload: { expIndex, bulletIndex }
      }),
      
    reorderExperienceBullets: (expIndex, fromIndex, toIndex) =>
      dispatch({
        type: ACTIONS.REORDER_EXPERIENCE_BULLETS,
        payload: { expIndex, fromIndex, toIndex }
      }),
      
    updateExperienceBullet: (expIndex, bulletIndex, newText) =>
      dispatch({
        type: ACTIONS.UPDATE_EXPERIENCE_BULLET,
        payload: { expIndex, bulletIndex, newText }
      }),
      
    clearStorage: () => {
      localStorage.removeItem('resumeBuilderState');
      dispatch({ type: ACTIONS.RESET_STATE });
    }
  };

  const value = {
    state,
    actions
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

// Custom hook to use the context
export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}


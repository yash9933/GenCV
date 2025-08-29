'use client';

import { createContext, useContext, useReducer, useEffect } from 'react';

// Initial state with new canonical JSON structure
const initialState = {
  // Form data
  jobDescription: '',
  originalResume: '',
  resumeJSON: {
    metadata: {
      name: '',
      contact: {
        phone: '',
        email: '',
        links: []
      },
      summary: ''
    },
    sections: []
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
  SAVE_TO_STORAGE: 'SAVE_TO_STORAGE'
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


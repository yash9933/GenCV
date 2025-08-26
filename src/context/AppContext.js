'use client';

import { createContext, useContext, useReducer } from 'react';

// Initial state
const initialState = {
  // Form data
  jobDescription: '',
  originalResume: '',
  resumeJSON: {}, // Structured resume data
  
  // Skills
  suggestedSkills: [],
  selectedSkills: [],
  
  // Generated content
  generatedBullets: [],
  originalBullets: [], // Array of original resume bullets with toggle state
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
  SET_ORIGINAL_BULLETS: 'SET_ORIGINAL_BULLETS',
  SET_COVER_LETTER: 'SET_COVER_LETTER',
  SET_INPUT_SUBMITTED: 'SET_INPUT_SUBMITTED',
  SET_GENERATING: 'SET_GENERATING',
  SET_CURRENT_STEP: 'SET_CURRENT_STEP',
  SET_ERROR: 'SET_ERROR',
  RESET_STATE: 'RESET_STATE',
  TOGGLE_GENERATED_BULLET: 'TOGGLE_GENERATED_BULLET',
  TOGGLE_ORIGINAL_BULLET: 'TOGGLE_ORIGINAL_BULLET',
  UPDATE_BULLET_POSITION: 'UPDATE_BULLET_POSITION'
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
      
    case ACTIONS.SET_ORIGINAL_BULLETS:
      return { ...state, originalBullets: action.payload };
      
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
      
         case ACTIONS.TOGGLE_GENERATED_BULLET:
       console.log('Reducer: TOGGLE_GENERATED_BULLET action received:', action.payload);
       console.log('Reducer: Current generated bullets:', state.generatedBullets.map(b => ({ id: b.id, isEnabled: b.isEnabled })));
       const updatedGeneratedBullets = state.generatedBullets.map(bullet => 
         bullet.id === action.payload.id 
           ? { ...bullet, isEnabled: action.payload.isEnabled }
           : bullet
       );
       console.log('Reducer: Updated generated bullets:', updatedGeneratedBullets.map(b => ({ id: b.id, isEnabled: b.isEnabled })));
       return { ...state, generatedBullets: updatedGeneratedBullets };
      
    case ACTIONS.TOGGLE_ORIGINAL_BULLET:
      const updatedOriginalBullets = state.originalBullets.map(bullet => 
        bullet.id === action.payload.id 
          ? { ...bullet, isEnabled: action.payload.isEnabled }
          : bullet
      );
      return { ...state, originalBullets: updatedOriginalBullets };
      
    case ACTIONS.UPDATE_BULLET_POSITION:
      const { sourceIndex, destinationIndex } = action.payload;
      const newBullets = [...state.generatedBullets];
      const [movedBullet] = newBullets.splice(sourceIndex, 1);
      newBullets.splice(destinationIndex, 0, movedBullet);
      return { ...state, generatedBullets: newBullets };
      
    default:
      return state;
  }
}

// Create context
const AppContext = createContext();

// Provider component
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

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
      
    setOriginalBullets: (bullets) => 
      dispatch({ type: ACTIONS.SET_ORIGINAL_BULLETS, payload: bullets }),
      
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
      
     toggleGeneratedBullet: (id, isEnabled) => {
       console.log('Action creator called with:', { id, isEnabled });
       dispatch({ 
         type: ACTIONS.TOGGLE_GENERATED_BULLET, 
         payload: { id, isEnabled } 
       });
     },
      
    toggleOriginalBullet: (id, isEnabled) => 
      dispatch({ 
        type: ACTIONS.TOGGLE_ORIGINAL_BULLET, 
        payload: { id, isEnabled } 
      }),
      
    updateBulletPosition: (sourceIndex, destinationIndex) => 
      dispatch({ 
        type: ACTIONS.UPDATE_BULLET_POSITION, 
        payload: { sourceIndex, destinationIndex } 
      })
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


import { createContext } from 'react';

import type { LearningExperienceContextType } from '../utils/types';

import { createLearningExperienceContext } from './createLearningExperienceContext';

export const LearningExperienceContext = createContext<LearningExperienceContextType>(
  createLearningExperienceContext(),
);

export const LearningExperienceContextProvider = LearningExperienceContext.Provider;

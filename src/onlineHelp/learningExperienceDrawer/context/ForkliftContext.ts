import { createContext } from 'react';
import { createOverviewContext } from 'src/overview/hooks/OverviewContext';

import type { ForkliftContextType } from '../types/types';

import { createLearningExperienceContext } from './LearningExperienceContext';

export const CreateForkliftContext = createContext<ForkliftContextType>({
  learningExperienceContext: createLearningExperienceContext(),
  overviewContext: createOverviewContext(),
});

export const CreateForkliftContextProvider = CreateForkliftContext.Provider;

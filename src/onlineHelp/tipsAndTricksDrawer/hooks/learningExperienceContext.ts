import { createContext } from 'react';

import type { CreateLearningExperienceContextType } from '../types/types';

export const createLearningExperienceContext = createContext<CreateLearningExperienceContextType>({
  setUserData: () => undefined,
});

export const createLearningExperienceContextProvider = createLearningExperienceContext.Provider;

import { createContext } from 'react';
import {
  createLearningExperienceContext,
  type LearningExperienceContextType,
} from 'src/onlineHelp/learningExperience/LearningExperienceContext';
import {
  createOverviewContext,
  type OverviewContextType,
} from 'src/overview/hooks/OverviewContext';

export type ForkliftContextType = {
  overviewContext: OverviewContextType;
  learningExperienceContext: LearningExperienceContextType;
};

export const CreateForkliftContext = createContext<ForkliftContextType>({
  learningExperienceContext: createLearningExperienceContext(),
  overviewContext: createOverviewContext(),
});

export const CreateForkliftContextProvider = CreateForkliftContext.Provider;

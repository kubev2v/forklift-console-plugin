import type { LearningExperienceContextType } from '../types/types';

export const createLearningExperienceContext = (): LearningExperienceContextType => ({
  clearData: () => null,
  closeExpansionItem: () => null,
  closeLearningExperience: () => null,
  data: {},
  isLearningExperienceOpen: false,
  openExpansionItem: () => null,
  openExpansionItems: [],
  openLearningExperience: () => null,
  scrollPosition: 0,
  setData: () => null,
  setScrollPosition: () => undefined,
  setSelectedTopic: () => undefined,
});

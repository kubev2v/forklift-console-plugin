import { DEFAULT_DRAWER_WIDTH } from '../utils/constants';
import type { LearningExperienceContextType } from '../utils/types';

export const createLearningExperienceContext = (): LearningExperienceContextType => ({
  clearData: () => null,
  closeLearningExperience: () => null,
  data: {},
  drawerWidth: DEFAULT_DRAWER_WIDTH,
  isLearningExperienceOpen: false,
  openLearningExperience: () => null,
  referenceScrollPositions: {},
  scrollPosition: 0,
  selectedTopic: null,
  setData: () => null,
  setDrawerWidth: () => null,
  setReferenceScrollPosition: () => null,
  setScrollPosition: () => null,
  setSelectedTopic: () => null,
});

import { DEFAULT_DRAWER_WIDTH } from '../utils/constants';
import type { LearningExperienceContextType } from '../utils/types';

// noop function for context defaults
const noop = () => {
  // intentionally empty - default context placeholder
};

export const createLearningExperienceContext = (): LearningExperienceContextType => ({
  clearData: noop,
  closeExpansionItem: noop,
  closeLearningExperience: noop,
  data: {},
  drawerWidth: DEFAULT_DRAWER_WIDTH,
  isLearningExperienceOpen: false,
  openExpansionItem: noop,
  openExpansionItems: [],
  openLearningExperience: noop,
  referenceScrollPositions: {},
  scrollPosition: 0,
  selectedTopic: null,
  setData: noop,
  setDrawerWidth: noop,
  setReferenceScrollPosition: noop,
  setScrollPosition: noop,
  setSelectedTopic: noop,
});

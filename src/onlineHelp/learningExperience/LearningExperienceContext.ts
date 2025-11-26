import type { LearningExperienceTopic } from 'src/onlineHelp/learningExperience/types';

export type LearningExperienceContextType = {
  isLearningExperienceOpen: boolean;
  openLearningExperience: () => void;
  closeLearningExperience: () => void;
  selectedTopic?: LearningExperienceTopic;
  setSelectedTopic: (topic: LearningExperienceTopic | undefined) => void;
  scrollPosition: number;
  setScrollPosition: (scrollPosition: number) => void;
  openExpansionItems: string[];
  openExpansionItem: (itemId: string) => void;
  closeExpansionItem: (itemId: string) => void;
  data: Record<string, any>;
  setData: (dataItem: string, dataValue: any) => void;
  clearData: (dataItem?: string) => void;
};

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

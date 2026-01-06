import type { LearningExperienceTopic } from 'src/onlineHelp/learningExperienceStructure/utils/types';
import type { OverviewContextType } from 'src/overview/hooks/OverviewContext';

export type LearningExperienceContextType = {
  isLearningExperienceOpen: boolean;
  selectedTopic?: LearningExperienceTopic;
  scrollPosition: number;
  openExpansionItems: string[];
  data: Record<string, any>;
  openLearningExperience: () => void;
  closeLearningExperience: () => void;
  setSelectedTopic: (topic: LearningExperienceTopic | undefined) => void;
  setScrollPosition: (scrollPosition: number) => void;
  openExpansionItem: (itemId: string) => void;
  closeExpansionItem: (itemId: string) => void;
  setData: (dataItem: string, dataValue: any) => void;
  clearData: (dataItem?: string) => void;
};

export type ForkliftContextType = {
  overviewContext: OverviewContextType;
  learningExperienceContext: LearningExperienceContextType;
};

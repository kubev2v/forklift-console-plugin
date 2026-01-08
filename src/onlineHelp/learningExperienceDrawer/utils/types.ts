import type { LearningExperienceTopic } from 'src/onlineHelp/utils/types';

export type LearningExperienceContextType = {
  isLearningExperienceOpen: boolean;
  selectedTopic: LearningExperienceTopic | null;
  scrollPosition: number;
  referenceScrollPositions: Record<string, number>;
  openExpansionItems: string[];
  drawerWidth: string;
  data: Record<string, any>;
  openLearningExperience: () => void;
  closeLearningExperience: () => void;
  setSelectedTopic: (topic: LearningExperienceTopic | null) => void;
  setScrollPosition: (scrollPosition: number) => void;
  setReferenceScrollPosition: (id: string, position: number) => void;
  setDrawerWidth: (width: string) => void;
  openExpansionItem: (itemId: string) => void;
  closeExpansionItem: (itemId: string) => void;
  setData: (dataItem: string, dataValue: any) => void;
  clearData: (dataItem?: string) => void;
};

export type PersistedState = {
  isLearningExperienceOpen?: boolean;
  openExpansionItems?: string[];
  scrollPosition?: number;
  referenceScrollPositions?: Record<string, number>;
  selectedTopicId?: string | null;
  drawerWidth?: string;
  data?: Record<string, any>;
};

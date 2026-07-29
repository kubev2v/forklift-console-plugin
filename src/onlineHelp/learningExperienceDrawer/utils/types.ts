import type { LearningExperienceTopic } from 'src/onlineHelp/utils/types';

export type AccordionContextType = {
  openExpansionItems: string[];
  openExpansionItem: (itemId: string) => void;
  closeExpansionItem: (itemId: string) => void;
};

export type LearningExperienceContextType = {
  isLearningExperienceOpen: boolean;
  selectedTopic: LearningExperienceTopic | null;
  scrollPosition: number;
  referenceScrollPositions: Record<string, number>;
  drawerWidth: string;
  data: Record<string, unknown>;
  openLearningExperience: () => void;
  closeLearningExperience: () => void;
  setSelectedTopic: (topic: LearningExperienceTopic | null) => void;
  setScrollPosition: (scrollPosition: number) => void;
  setReferenceScrollPosition: (id: string, position: number) => void;
  setDrawerWidth: (width: string) => void;
  setData: (dataItem: string, dataValue: unknown) => void;
  clearData: (dataItem?: string) => void;
};

export type PersistedState = {
  isLearningExperienceOpen?: boolean;
  openExpansionItems?: string[];
  scrollPosition?: number;
  referenceScrollPositions?: Record<string, number>;
  selectedTopicId?: string | null;
  drawerWidth?: string;
  data?: Record<string, unknown>;
};

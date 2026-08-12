import type { LearningExperienceTopic } from 'src/onlineHelp/utils/types';

export type AccordionContextType = {
  closeExpansionItem: (itemId: string) => void;
  openExpansionItem: (itemId: string) => void;
  openExpansionItems: string[];
};

export type LearningExperienceContextType = {
  clearData: (dataItem?: string) => void;
  closeLearningExperience: () => void;
  data: Record<string, unknown>;
  drawerWidth: string;
  isLearningExperienceOpen: boolean;
  openLearningExperience: () => void;
  referenceScrollPositions: Record<string, number>;
  scrollPosition: number;
  selectedTopic: LearningExperienceTopic | null;
  setData: (dataItem: string, dataValue: unknown) => void;
  setDrawerWidth: (width: string) => void;
  setReferenceScrollPosition: (id: string, position: number) => void;
  setScrollPosition: (scrollPosition: number) => void;
  setSelectedTopic: (topic: LearningExperienceTopic | null) => void;
};

export type PersistedState = {
  data?: Record<string, unknown>;
  drawerWidth?: string;
  isLearningExperienceOpen?: boolean;
  openExpansionItems?: string[];
  referenceScrollPositions?: Record<string, number>;
  scrollPosition?: number;
  selectedTopicId?: string | null;
};

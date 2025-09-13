import type { ReactElement, ReactNode } from 'react';

export type ListStyleType =
  | 'circle'
  | 'square'
  | 'disc'
  | 'decimal'
  | 'lower-alpha'
  | 'descriptions'
  | 'none';

export type LearningExperienceSubTopic = {
  id: string;
  title?: ReactNode;
  expandable?: boolean;
  subListStyleType?: ListStyleType;
  subTopics?: LearningExperienceSubTopic[];
};

export type LearningExperienceTopic = {
  description: ReactNode;
  icon: ReactElement;
  id: string;
  title: ReactNode;
  expandable?: boolean;
  subListStyleType?: ListStyleType;
  subTopics: LearningExperienceSubTopic[];
  subTopicsIndexed?: boolean;
};

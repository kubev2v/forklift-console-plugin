import type { ReactElement, ReactNode } from 'react';

export enum ListStyleType {
  CIRCLE = 'circle',
  SQUARE = 'square',
  DISC = 'disc',
  DECIMAL = 'decimal',
  LOWER_ALPHA = 'lower-alpha',
  DESCRIPTIONS = 'descriptions',
  NONE = 'none',
}

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
  trackingEventTopic: string;
};

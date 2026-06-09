import type { ComponentClass, ReactNode } from 'react';

import type { SVGIconProps } from '@patternfly/react-icons/dist/esm/createIcon';
import type { ProviderTypes } from '@utils/providers/constants';

export enum ListStyleType {
  CIRCLE = 'circle',
  SQUARE = 'square',
  DISC = 'disc',
  DECIMAL = 'decimal',
  LOWER_ALPHA = 'lower-alpha',
  LOWER_ROMAN = 'lower-roman',
  DESCRIPTIONS = 'descriptions',
  NONE = 'none',
}

export type LearningExperienceSubTopic = {
  id: string;
  title?: ReactNode;
  className?: string;
  expandable?: boolean;
  subListStyleType?: ListStyleType;
  subTopics?: () => LearningExperienceSubTopic[];
};

export type LearningExperienceTopic = {
  description: ReactNode;
  icon: ComponentClass<SVGIconProps>;
  id: string;
  title: ReactNode;
  expandable?: boolean;
  subListStyleType?: ListStyleType;
  subTopics: (providerType?: ProviderTypes) => LearningExperienceSubTopic[];
  subTopicsIndexed?: boolean;
  trackingEventTopic: string;
};

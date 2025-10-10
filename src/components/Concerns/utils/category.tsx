import type { ReactNode } from 'react';

import type { Concern } from '@kubev2v/types';
import type { LabelProps } from '@patternfly/react-core';
import {
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  InfoCircleIcon,
} from '@patternfly/react-icons';
import { t } from '@utils/i18n';

import { type ConcernCategory, ConcernCategoryOptions } from './constants';

export const CATEGORY_TITLES: Record<ConcernCategory, string> = {
  [ConcernCategoryOptions.Critical]: t('Critical concerns'),
  [ConcernCategoryOptions.Information]: t('Information concerns'),
  [ConcernCategoryOptions.Warning]: t('Warning concerns'),
};

const CATEGORY_ICONS: Record<ConcernCategory, ReactNode> = {
  [ConcernCategoryOptions.Critical]: <ExclamationCircleIcon />,
  [ConcernCategoryOptions.Information]: <InfoCircleIcon />,
  [ConcernCategoryOptions.Warning]: <ExclamationTriangleIcon />,
};

const CATEGORY_COLORS: Record<ConcernCategory, LabelProps['color']> = {
  [ConcernCategoryOptions.Critical]: 'red',
  [ConcernCategoryOptions.Information]: 'blue',
  [ConcernCategoryOptions.Warning]: 'orange',
};

const isConcernCategory = (value: string): value is ConcernCategory =>
  Object.values(ConcernCategoryOptions).includes(value as ConcernCategory);

export const getCategoryTitle = (category: string): string => {
  return isConcernCategory(category) ? CATEGORY_TITLES[category] : '';
};

export const getCategoryIcon = (category: string): ReactNode => {
  return isConcernCategory(category) ? CATEGORY_ICONS[category] : <></>;
};

export const getCategoryColor = (category: string): LabelProps['color'] => {
  return isConcernCategory(category) ? CATEGORY_COLORS[category] : 'grey';
};

export const groupConcernsByCategory = (
  concerns: Concern[] = [],
): Record<ConcernCategory, Concern[]> => {
  return concerns.reduce<Record<string, Concern[]>>(
    (acc, concern) => {
      if (!acc[concern.category]) {
        acc[concern.category] = [];
      }
      acc[concern.category].push(concern);
      return acc;
    },
    {
      [ConcernCategoryOptions.Critical]: [],
      [ConcernCategoryOptions.Information]: [],
      [ConcernCategoryOptions.Warning]: [],
    },
  );
};

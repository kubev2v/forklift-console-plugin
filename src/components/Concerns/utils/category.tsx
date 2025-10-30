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

const CATEGORY_TITLES: Record<ConcernCategory, string> = {
  [ConcernCategoryOptions.Critical]: t('Critical concerns'),
  [ConcernCategoryOptions.Information]: t('Information concerns'),
  [ConcernCategoryOptions.Warning]: t('Warning concerns'),
};

const CATEGORY_ICONS: Record<ConcernCategory, ReactNode> = {
  [ConcernCategoryOptions.Critical]: <ExclamationCircleIcon color="#C9190B" />,
  [ConcernCategoryOptions.Information]: <InfoCircleIcon color="#2B9AF3" />,
  [ConcernCategoryOptions.Warning]: <ExclamationTriangleIcon color="#F0AB00" />,
};

const CATEGORY_STATUS: Record<ConcernCategory, LabelProps['status'] | undefined> = {
  [ConcernCategoryOptions.Critical]: 'danger',
  [ConcernCategoryOptions.Information]: 'info',
  [ConcernCategoryOptions.Warning]: 'warning',
};

const isConcernCategory = (value: string): value is ConcernCategory =>
  Object.values(ConcernCategoryOptions).includes(value as ConcernCategory);

export const getCategoryTitle = (category: string): string => {
  return isConcernCategory(category) ? CATEGORY_TITLES[category] : '';
};

export const getCategoryIcon = (category: string): ReactNode => {
  return isConcernCategory(category) ? CATEGORY_ICONS[category] : <></>;
};

export const getCategoryStatus = (category: string): LabelProps['status'] | undefined => {
  return isConcernCategory(category) ? CATEGORY_STATUS[category] : undefined;
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

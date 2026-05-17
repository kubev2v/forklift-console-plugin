import type { ReactNode } from 'react';

import type { Concern, V1beta1PlanStatusConditions } from '@forklift-ui/types';
import { Icon, type LabelProps } from '@patternfly/react-core';
import {
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  InfoCircleIcon,
} from '@patternfly/react-icons';
import { isEmpty } from '@utils/helpers';
import { t } from '@utils/i18n';

import { type ConcernCategory, ConcernCategoryOptions } from './constants';

const CATEGORY_LABELS: Record<ConcernCategory, string> = {
  [ConcernCategoryOptions.Advisory]: 'Advisory',
  [ConcernCategoryOptions.Critical]: 'Critical',
  [ConcernCategoryOptions.Error]: 'Error',
  [ConcernCategoryOptions.Information]: 'Information',
  [ConcernCategoryOptions.Warn]: 'Warning',
  [ConcernCategoryOptions.Warning]: 'Warning',
};

const CATEGORY_TITLES: Record<ConcernCategory, string> = {
  [ConcernCategoryOptions.Advisory]: t('Advisory concerns'),
  [ConcernCategoryOptions.Critical]: t('Critical concerns'),
  [ConcernCategoryOptions.Error]: t('Error concerns'),
  [ConcernCategoryOptions.Information]: t('Information concerns'),
  [ConcernCategoryOptions.Warn]: t('Warning concerns'),
  [ConcernCategoryOptions.Warning]: t('Warning concerns'),
};

const CATEGORY_ICONS: Record<ConcernCategory, ReactNode> = {
  [ConcernCategoryOptions.Advisory]: (
    <Icon status="info">
      <InfoCircleIcon />
    </Icon>
  ),
  [ConcernCategoryOptions.Critical]: (
    <Icon status="danger">
      <ExclamationCircleIcon />
    </Icon>
  ),
  [ConcernCategoryOptions.Error]: (
    <Icon status="danger">
      <ExclamationCircleIcon />
    </Icon>
  ),
  [ConcernCategoryOptions.Information]: (
    <Icon status="info">
      <InfoCircleIcon />
    </Icon>
  ),
  [ConcernCategoryOptions.Warn]: (
    <Icon status="warning">
      <ExclamationTriangleIcon />
    </Icon>
  ),
  [ConcernCategoryOptions.Warning]: (
    <Icon status="warning">
      <ExclamationTriangleIcon />
    </Icon>
  ),
};

const CATEGORY_STATUS: Record<ConcernCategory, LabelProps['status'] | undefined> = {
  [ConcernCategoryOptions.Advisory]: 'info',
  [ConcernCategoryOptions.Critical]: 'danger',
  [ConcernCategoryOptions.Error]: 'danger',
  [ConcernCategoryOptions.Information]: 'info',
  [ConcernCategoryOptions.Warn]: 'warning',
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
  if (isConcernCategory(category)) return CATEGORY_STATUS[category];
  return 'warning';
};

export const getCategoryLabel = (category: string): string => {
  return CATEGORY_LABELS[category as ConcernCategory];
};

export const groupConcernsByCategory = (
  concerns: Concern[] = [],
): Record<ConcernCategory, Concern[]> => {
  return concerns.reduce<Record<string, Concern[]>>(
    (acc, concern) => {
      if (isEmpty(concern)) return acc;
      if (isEmpty(acc[concern?.category])) {
        acc[concern?.category] = [];
      }
      acc[concern?.category].push(concern);
      return acc;
    },
    {
      [ConcernCategoryOptions.Critical]: [],
      [ConcernCategoryOptions.Information]: [],
      [ConcernCategoryOptions.Warning]: [],
    },
  );
};

export const groupConditionsByCategory = (
  conditions: V1beta1PlanStatusConditions[] = [],
): Record<ConcernCategory, V1beta1PlanStatusConditions[]> => {
  return conditions.reduce<Record<string, V1beta1PlanStatusConditions[]>>(
    (acc, condition) => {
      if (isEmpty(getCategoryLabel(condition?.category))) return acc;
      if (isEmpty(acc[getCategoryLabel(condition?.category)])) {
        acc[condition?.category] = [];
      }
      acc[getCategoryLabel(condition?.category)].push(condition);
      return acc;
    },
    {
      [ConcernCategoryOptions.Critical]: [],
      [ConcernCategoryOptions.Information]: [],
      [ConcernCategoryOptions.Warning]: [],
    },
  );
};

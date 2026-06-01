import type { ReactNode } from 'react';

import { STATUS_ICONS } from '@components/status/statusIcons';
import type { Concern, V1beta1PlanStatusConditions } from '@forklift-ui/types';
import { PF_LABEL_STATUS, type PfLabelStatus } from '@utils/constants';
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
  [ConcernCategoryOptions.Advisory]: STATUS_ICONS.info,
  [ConcernCategoryOptions.Critical]: STATUS_ICONS.danger,
  [ConcernCategoryOptions.Error]: STATUS_ICONS.danger,
  [ConcernCategoryOptions.Information]: STATUS_ICONS.info,
  [ConcernCategoryOptions.Warn]: STATUS_ICONS.warning,
  [ConcernCategoryOptions.Warning]: STATUS_ICONS.warning,
};

const CATEGORY_STATUS: Record<ConcernCategory, PfLabelStatus | undefined> = {
  [ConcernCategoryOptions.Advisory]: PF_LABEL_STATUS.INFO,
  [ConcernCategoryOptions.Critical]: PF_LABEL_STATUS.DANGER,
  [ConcernCategoryOptions.Error]: PF_LABEL_STATUS.DANGER,
  [ConcernCategoryOptions.Information]: PF_LABEL_STATUS.INFO,
  [ConcernCategoryOptions.Warn]: PF_LABEL_STATUS.WARNING,
  [ConcernCategoryOptions.Warning]: PF_LABEL_STATUS.WARNING,
};

const isConcernCategory = (value: string): value is ConcernCategory =>
  Object.values(ConcernCategoryOptions).includes(value as ConcernCategory);

export const getCategoryTitle = (category: string): string => {
  return isConcernCategory(category) ? CATEGORY_TITLES[category] : '';
};

export const getCategoryIcon = (category: string): ReactNode => {
  return isConcernCategory(category) ? CATEGORY_ICONS[category] : <></>;
};

export const getCategoryStatus = (category: string): PfLabelStatus | undefined => {
  if (isConcernCategory(category)) return CATEGORY_STATUS[category];
  return PF_LABEL_STATUS.WARNING;
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
      [ConcernCategoryOptions.Advisory]: [],
      [ConcernCategoryOptions.Critical]: [],
      [ConcernCategoryOptions.Error]: [],
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
      const label = getCategoryLabel(condition?.category);
      if (isEmpty(label)) return acc;
      if (isEmpty(acc[label])) {
        acc[label] = [];
      }
      acc[label].push(condition);
      return acc;
    },
    {
      [ConcernCategoryOptions.Advisory]: [],
      [ConcernCategoryOptions.Critical]: [],
      [ConcernCategoryOptions.Error]: [],
      [ConcernCategoryOptions.Information]: [],
      [ConcernCategoryOptions.Warning]: [],
    },
  );
};

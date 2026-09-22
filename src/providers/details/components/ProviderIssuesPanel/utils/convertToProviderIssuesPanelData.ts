import type { K8sResourceCondition } from '@forklift-ui/types';

import type { ProviderIssuesPanelData } from './types';

const getItemsCount = (condition: K8sResourceCondition): number => {
  const { items } = condition as K8sResourceCondition & { items?: unknown[] };
  return Array.isArray(items) ? items.length : 0;
};

const getConditionCategory = (condition: K8sResourceCondition): string => {
  const { category } = condition as { category?: unknown };
  return typeof category === 'string' ? category : '';
};

const getConditionType = (condition: K8sResourceCondition): string => {
  const { type } = condition as { type?: unknown };
  return typeof type === 'string' ? type : '';
};

export const convertToProviderIssuesPanelData = (
  conditions: K8sResourceCondition[],
  hasHostsTab: boolean,
  providerUrl: string,
): ProviderIssuesPanelData[] =>
  conditions.map((condition) => ({
    condition: {
      itemsCount: getItemsCount(condition),
      message: condition.message,
      severity: getConditionCategory(condition),
      type: getConditionType(condition),
    },
    hasHostsTab,
    providerUrl,
  }));

import type { K8sResourceCondition } from '@forklift-ui/types';

import { getConditionCategory, getConditionType } from '../../../utils/providerConditionUtils';

import type { ProviderIssuesPanelData } from './types';

export const convertToProviderIssuesPanelData = (
  conditions: K8sResourceCondition[],
  providerName: string,
): ProviderIssuesPanelData[] =>
  conditions.map((condition) => ({
    condition: {
      message: condition.message,
      resource: providerName,
      severity: getConditionCategory(condition),
      type: getConditionType(condition),
    },
  }));

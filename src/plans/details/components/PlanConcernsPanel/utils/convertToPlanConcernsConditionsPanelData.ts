import { ConcernCategoryOptions } from '@components/Concerns/utils/constants';
import type { V1beta1PlanStatusConditions } from '@forklift-ui/types';

import { CONCERN_SOURCE, type PlanConcernsPanelData } from './types';

export const convertToPlanConcernsConditionsPanelData = (
  criticalConditions: V1beta1PlanStatusConditions[] | undefined,
  mergedConcernsMap: Map<string, number>,
  planUrl: string,
  inspectionConcernLabels: Set<string> = new Set(),
): PlanConcernsPanelData[] => [
  ...(criticalConditions ?? []).map((criticalCondition) => ({
    criticalConditionOrConcern: {
      message: criticalCondition?.message,
      severity: criticalCondition?.category,
      source: CONCERN_SOURCE.CONDITION,
      type: criticalCondition?.type,
      vmsNum: criticalCondition?.items?.length ?? 0,
    },
    planUrl,
  })),
  ...Array.from(mergedConcernsMap.entries()).map(([type, numOfVms]) => ({
    criticalConditionOrConcern: {
      message: type,
      severity: ConcernCategoryOptions.Critical,
      source: inspectionConcernLabels.has(type)
        ? CONCERN_SOURCE.INSPECTION
        : CONCERN_SOURCE.INVENTORY,
      type,
      vmsNum: numOfVms ?? 0,
    },
    planUrl,
  })),
];

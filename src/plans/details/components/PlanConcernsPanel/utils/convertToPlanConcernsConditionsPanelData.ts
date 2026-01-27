import { ConcernCategoryOptions } from '@components/Concerns/utils/constants';
import type { V1beta1PlanStatusConditions } from '@forklift-ui/types';

import type { PlanConcernsPanelData } from './types';

export const convertToPlanConcernsConditionsPanelData = (
  criticalConditions: V1beta1PlanStatusConditions[] | undefined,
  criticalConcernsVMsNumMap: Map<string, number>,
  planUrl: string,
): PlanConcernsPanelData[] => [
  ...(criticalConditions ?? []).map((criticalCondition) => ({
    criticalConditionOrConcern: {
      message: criticalCondition?.message,
      severity: criticalCondition?.category,
      type: criticalCondition?.type,
      vmsNum: criticalCondition?.items?.length ?? 0,
    },
    planUrl,
  })),
  ...Array.from(criticalConcernsVMsNumMap.entries()).map(([type, numOfVms]) => ({
    criticalConditionOrConcern: {
      message: type,
      severity: ConcernCategoryOptions.Critical,
      type,
      vmsNum: numOfVms ?? 0,
    },
    planUrl,
  })),
];

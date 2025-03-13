import { V1beta1Plan } from '@kubev2v/types';

import { PlanConditionStatus, PlanConditionType } from '../types/PlanCondition';

/**
 * Gets a record of plan types with truthful ('True') statuses
 * @param plan V1beta1Plan
 * @returns Record<string, boolean>
 */
export const getConditionTypes = (plan: V1beta1Plan): Record<PlanConditionType, boolean> =>
  plan?.status?.conditions?.reduce((acc, condition) => {
    if (condition.status === PlanConditionStatus.True) {
      acc[condition.type] = true;
    }

    return acc;
  }, {} as Record<PlanConditionType, boolean>);

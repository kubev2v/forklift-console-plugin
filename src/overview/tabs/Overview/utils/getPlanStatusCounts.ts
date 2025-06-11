import { PlanStatuses } from 'src/plans/details/components/PlanStatus/utils/types';
import { getPlanStatus } from 'src/plans/details/components/PlanStatus/utils/utils';

import type { V1beta1Plan } from '@kubev2v/types';

/**
 * This function gets the number of 'Running', 'Failed', and 'Succeeded' plans.
 */
export const getPlanStatusCounts = (plans?: V1beta1Plan[]): Record<string, number> => {
  let Total = 0;
  const planStatusCounts: Record<PlanStatuses, number> = Object.fromEntries(
    Object.values(PlanStatuses).map((status) => [status, 0]),
  ) as Record<PlanStatuses, number>;

  for (const plan of plans ?? []) {
    Total += 1;

    const status = getPlanStatus(plan);
    if (status in planStatusCounts) {
      planStatusCounts[status] += 1;
    }
  }

  return {
    ...planStatusCounts,
    Total,
  };
};

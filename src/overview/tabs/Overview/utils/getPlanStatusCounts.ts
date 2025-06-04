import { PlanStatuses } from 'src/plans/details/components/PlanStatus/utils/types';
import { getPlanStatus } from 'src/plans/details/components/PlanStatus/utils/utils';

import type { V1beta1Plan } from '@kubev2v/types';

/**
 * This function gets the number of 'Running', 'Failed', and 'Succeeded' plans.
 * @param {V1beta1Plan[]} plans - The array of plan objects to inspect.
 * @return {Object} A dictionary with the phase as the key and the count as the value.
 */
export const getPlanStatusCounts = (plans: V1beta1Plan[]): Record<string, number> => {
  const planStatusCounts: Record<string, number> = {
    [PlanStatuses.Archived]: 0,
    [PlanStatuses.Canceled]: 0,
    [PlanStatuses.CannotStart]: 0,
    [PlanStatuses.Completed]: 0,
    [PlanStatuses.Executing]: 0,
    [PlanStatuses.Incomplete]: 0,
    [PlanStatuses.Paused]: 0,
    [PlanStatuses.Ready]: 0,
    Total: 0,
  };

  for (const plan of plans || []) {
    planStatusCounts.Total += 1;

    const status = getPlanStatus(plan);
    if (status in planStatusCounts) {
      planStatusCounts[status] += 1;
    }
  }

  return planStatusCounts;
};

import { PlanStatuses } from 'src/plans/details/components/PlanStatus/utils/types';
import { getPlanStatus } from 'src/plans/details/components/PlanStatus/utils/utils';

import type { V1beta1Plan } from '@forklift-ui/types';
import { getName, getNamespace, getOwnerReference, getUID } from '@utils/crds/common/selectors';
import { getPlanArchived } from '@utils/crds/plans/selectors';

import { BULK_PLAN_ACTION_CONCURRENCY } from './constants';

export type JsonPatchOp = {
  op: 'add' | 'replace';
  path: string;
  value: boolean;
};

export const getPlanRowId = (plan: V1beta1Plan): string =>
  getUID(plan) ?? `${getNamespace(plan) ?? ''}/${getName(plan) ?? ''}`;

export const getSelectedPlans = (plans: V1beta1Plan[], selectedIds: string[]): V1beta1Plan[] => {
  const idSet = new Set(selectedIds);
  return plans.filter((plan) => idSet.has(getPlanRowId(plan)));
};

export const getPlansEligibleForArchive = (plans: V1beta1Plan[]): V1beta1Plan[] =>
  plans.filter((plan) => getPlanStatus(plan) !== PlanStatuses.Archived);

export const hasRunningSelectedPlans = (plans: V1beta1Plan[]): boolean =>
  plans.some((plan) => {
    const status = getPlanStatus(plan);
    return status === PlanStatuses.Executing || status === PlanStatuses.Pending;
  });

export const hasUnarchivedSelectedPlans = (plans: V1beta1Plan[]): boolean =>
  plans.some((plan) => getPlanStatus(plan) !== PlanStatuses.Archived);

export const getOwnedPlans = (plans: V1beta1Plan[]): V1beta1Plan[] =>
  plans.filter((plan) => Boolean(getOwnerReference(plan)));

export const hasOwnedSelectedPlans = (plans: V1beta1Plan[]): boolean =>
  plans.some((plan) => Boolean(getOwnerReference(plan)));

export const buildArchivePlanPatch = (plan: V1beta1Plan): JsonPatchOp[] => [
  {
    op: getPlanArchived(plan) ? 'replace' : 'add',
    path: '/spec/archived',
    value: true,
  },
];

export const runSettledInBatches = async <T>(
  items: T[],
  worker: (item: T) => Promise<unknown>,
  concurrencyLimit: number = BULK_PLAN_ACTION_CONCURRENCY,
): Promise<PromiseSettledResult<unknown>[]> => {
  const results: PromiseSettledResult<unknown>[] = [];

  for (let offset = 0; offset < items.length; offset += concurrencyLimit) {
    const chunk = items.slice(offset, offset + concurrencyLimit);
    const chunkResults = await Promise.allSettled(chunk.map(async (item) => worker(item)));
    results.push(...chunkResults);
  }

  return results;
};

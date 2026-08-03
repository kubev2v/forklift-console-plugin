import { ADD, REPLACE } from 'src/components/ModalForm/utils/constants';
import { PlanStatuses } from 'src/plans/details/components/PlanStatus/utils/types';
import { getPlanStatus } from 'src/plans/details/components/PlanStatus/utils/utils';

import type { V1beta1Plan } from '@forklift-ui/types';
import { getName, getNamespace, getOwnerReference, getUID } from '@utils/crds/common/selectors';
import { getPlanArchived } from '@utils/crds/plans/selectors';

import { BULK_PLAN_ACTION_CONCURRENCY, INITIAL_BATCH_OFFSET } from './constants';

type JsonPatchOp = {
  op: typeof ADD | typeof REPLACE;
  path: string;
  value: boolean;
};

export type BulkPlanActionFailure = {
  name: string;
  message: string;
};

export const getPlanRowId = (plan: V1beta1Plan): string =>
  getUID(plan) ?? `${getNamespace(plan) ?? ''}/${getName(plan) ?? ''}`;

export const getSelectedPlans = (plans: V1beta1Plan[], selectedIds: string[]): V1beta1Plan[] => {
  const idSet = new Set(selectedIds);
  return plans.filter((plan) => idSet.has(getPlanRowId(plan)));
};

export const isPlanRunningOrPending = (plan: V1beta1Plan): boolean => {
  const status = getPlanStatus(plan);
  return status === PlanStatuses.Executing || status === PlanStatuses.Pending;
};

/** MTV-6297: running/pending plans must not be selectable for bulk archive/delete. */
export const canSelectPlanForBulkActions = (plan: V1beta1Plan): boolean =>
  !isPlanRunningOrPending(plan);

export const getPlansEligibleForArchive = (plans: V1beta1Plan[]): V1beta1Plan[] =>
  plans.filter(
    (plan) => getPlanStatus(plan) !== PlanStatuses.Archived && !isPlanRunningOrPending(plan),
  );

export const getPlansEligibleForDelete = (plans: V1beta1Plan[]): V1beta1Plan[] =>
  plans.filter((plan) => !isPlanRunningOrPending(plan));

export const hasNonArchivedSelectedPlans = (plans: V1beta1Plan[]): boolean =>
  plans.some((plan) => getPlanStatus(plan) !== PlanStatuses.Archived);

export const getOwnedPlans = (plans: V1beta1Plan[]): V1beta1Plan[] =>
  plans.filter((plan) => Boolean(getOwnerReference(plan)));

export const buildArchivePlanPatch = (plan: V1beta1Plan): JsonPatchOp[] => [
  {
    op: getPlanArchived(plan) ? REPLACE : ADD,
    path: '/spec/archived',
    value: true,
  },
];

export const getBulkActionFailure = (plan: V1beta1Plan, reason: unknown): BulkPlanActionFailure => {
  const error = reason as { message?: string; code?: number | string };
  const messageParts = [error?.message ?? String(reason)];
  if (error?.code !== undefined && error?.code !== null && error?.code !== '') {
    messageParts.push(`(${String(error.code)})`);
  }

  return {
    message: messageParts.join(' '),
    name: getName(plan) ?? getPlanRowId(plan),
  };
};

const processChunk = async <T>(
  items: T[],
  worker: (item: T) => Promise<unknown>,
  concurrencyLimit: number,
  offset: number,
  results: PromiseSettledResult<unknown>[],
): Promise<PromiseSettledResult<unknown>[]> => {
  if (offset >= items.length) {
    return results;
  }

  const chunk = items.slice(offset, offset + concurrencyLimit);
  const chunkResults = await Promise.allSettled(chunk.map(async (item) => worker(item)));
  results.push(...chunkResults);

  return processChunk(items, worker, concurrencyLimit, offset + concurrencyLimit, results);
};

export const runSettledInBatches = async <T>(
  items: T[],
  worker: (item: T) => Promise<unknown>,
  concurrencyLimit: number = BULK_PLAN_ACTION_CONCURRENCY,
): Promise<PromiseSettledResult<unknown>[]> =>
  processChunk(items, worker, concurrencyLimit, INITIAL_BATCH_OFFSET, []);

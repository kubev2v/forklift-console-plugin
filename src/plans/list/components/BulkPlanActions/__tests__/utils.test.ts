import { mockI18n } from '@test-utils/mockI18n';

mockI18n();

import { ADD, REPLACE } from 'src/components/ModalForm/utils/constants';
import { PlanStatuses } from 'src/plans/details/components/PlanStatus/utils/types';

import type { V1beta1Plan } from '@forklift-ui/types';
import { describe, expect, it } from '@jest/globals';

import {
  buildArchivePlanPatch,
  canSelectPlanForBulkActions,
  getOwnedPlans,
  getPlanRowId,
  getPlansEligibleForArchive,
  getPlansEligibleForDelete,
  getSelectedPlans,
  hasNonArchivedSelectedPlans,
  isPlanRunningOrPending,
  runSettledInBatches,
} from '../utils';

const createPlan = ({
  archived = false,
  name,
  namespace = 'default',
  ownerName,
  startedVm = false,
  status,
  uid,
}: {
  archived?: boolean;
  name: string;
  namespace?: string;
  ownerName?: string;
  startedVm?: boolean;
  status?: PlanStatuses;
  uid?: string;
}): V1beta1Plan => {
  let conditionType: string | undefined = status;
  if (status === PlanStatuses.Completed) {
    conditionType = 'Succeeded';
  } else if (status === PlanStatuses.Pending || status === PlanStatuses.Executing) {
    conditionType = PlanStatuses.Executing;
  }

  const hasStartedMigration =
    status === PlanStatuses.Executing || status === PlanStatuses.Pending
      ? {
          migration: {
            vms: startedVm ? [{ id: 'vm-1', name: 'vm-1', started: '2024-01-01T00:00:00Z' }] : [],
          },
        }
      : {};

  return {
    metadata: {
      name,
      namespace,
      ...(ownerName
        ? {
            ownerReferences: [
              { apiVersion: 'v1', kind: 'ConfigMap', name: ownerName, uid: 'owner-1' },
            ],
          }
        : {}),
      uid,
    },
    spec: { archived },
    status: {
      conditions: conditionType ? [{ status: 'True', type: conditionType }] : [],
      ...hasStartedMigration,
    },
  } as V1beta1Plan;
};

describe('BulkPlanActions utils', () => {
  it('builds a stable plan row id from uid or namespace/name', () => {
    expect(getPlanRowId(createPlan({ name: 'plan-a', uid: 'uid-1' }))).toBe('uid-1');
    expect(getPlanRowId(createPlan({ name: 'plan-b', namespace: 'ns1' }))).toBe('ns1/plan-b');
  });

  it('resolves selected plans by row id', () => {
    const plans = [
      createPlan({ name: 'plan-a', uid: 'uid-1' }),
      createPlan({ name: 'plan-b', uid: 'uid-2' }),
      createPlan({ name: 'plan-c', uid: 'uid-3' }),
    ];

    expect(getSelectedPlans(plans, ['uid-1', 'uid-3']).map((plan) => plan.metadata?.name)).toEqual([
      'plan-a',
      'plan-c',
    ]);
  });

  it('excludes archived and running/pending plans from archive eligibility', () => {
    const plans = [
      createPlan({ archived: true, name: 'archived', status: PlanStatuses.Archived }),
      createPlan({ name: 'ready', status: PlanStatuses.Ready }),
      createPlan({ name: 'pending', status: PlanStatuses.Pending }),
      createPlan({ name: 'executing', startedVm: true, status: PlanStatuses.Executing }),
    ];

    expect(getPlansEligibleForArchive(plans).map((plan) => plan.metadata?.name)).toEqual(['ready']);
  });

  it('excludes running/pending plans from delete eligibility', () => {
    const plans = [
      createPlan({ archived: true, name: 'archived', status: PlanStatuses.Archived }),
      createPlan({ name: 'ready', status: PlanStatuses.Ready }),
      createPlan({ name: 'pending', status: PlanStatuses.Pending }),
    ];

    expect(getPlansEligibleForDelete(plans).map((plan) => plan.metadata?.name)).toEqual([
      'archived',
      'ready',
    ]);
  });

  it('detects executing and pending plans for MTV-6297', () => {
    const executing = createPlan({
      name: 'executing',
      startedVm: true,
      status: PlanStatuses.Executing,
    });
    const pending = createPlan({ name: 'pending', status: PlanStatuses.Pending });
    const archived = createPlan({
      archived: true,
      name: 'archived',
      status: PlanStatuses.Archived,
    });

    expect(isPlanRunningOrPending(executing)).toBe(true);
    expect(isPlanRunningOrPending(pending)).toBe(true);
    expect(isPlanRunningOrPending(archived)).toBe(false);
    expect(canSelectPlanForBulkActions(executing)).toBe(false);
    expect(canSelectPlanForBulkActions(pending)).toBe(false);
    expect(canSelectPlanForBulkActions(archived)).toBe(true);
    expect(hasNonArchivedSelectedPlans([executing, archived])).toBe(true);
    expect(hasNonArchivedSelectedPlans([archived])).toBe(false);
  });

  it('detects owned selected plans via getOwnedPlans', () => {
    const owned = createPlan({ name: 'owned', ownerName: 'manager' });
    const unowned = createPlan({ name: 'unowned' });

    expect(getOwnedPlans([owned, unowned]).map((plan) => plan.metadata?.name)).toEqual(['owned']);
    expect(getOwnedPlans([unowned])).toEqual([]);
  });

  it('builds archive patch with project ADD/REPLACE constants', () => {
    expect(buildArchivePlanPatch(createPlan({ name: 'new' }))).toEqual([
      { op: ADD, path: '/spec/archived', value: true },
    ]);
    expect(buildArchivePlanPatch(createPlan({ archived: true, name: 'existing' }))).toEqual([
      { op: REPLACE, path: '/spec/archived', value: true },
    ]);
  });

  it('runs workers in bounded batches without await-in-loop', async () => {
    const activeCounts: number[] = [];
    let active = 0;

    const results = await runSettledInBatches(
      [1, 2, 3, 4, 5],
      async (value) => {
        active += 1;
        activeCounts.push(active);
        await Promise.resolve(value);
        active -= 1;
      },
      2,
    );

    expect(results).toHaveLength(5);
    expect(results.every((result) => result.status === 'fulfilled')).toBe(true);
    expect(Math.max(...activeCounts)).toBeLessThanOrEqual(2);
  });

  it('collects rejected results from batched workers', async () => {
    const results = await runSettledInBatches(
      [1, 2, 3],
      (value) => {
        if (value === 2) {
          return Promise.reject(new Error('boom'));
        }
        return Promise.resolve();
      },
      2,
    );

    expect(results.map((result) => result.status)).toEqual(['fulfilled', 'rejected', 'fulfilled']);
  });
});

import { mockI18n } from '@test-utils/mockI18n';

mockI18n();

import { ADD, REPLACE } from 'src/components/ModalForm/utils/constants';

import { describe, expect, it } from '@jest/globals';

import {
  buildArchivePlanPatch,
  getOwnedPlans,
  getPlanIds,
  getPlanRowId,
  getSelectedPlans,
  getSucceededPlanIds,
} from '../utils';

import { createPlan } from './bulkPlanActionsUtils.fixtures';

describe('BulkPlanActions utils - selection', () => {
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

  it('detects owned selected plans via getOwnedPlans', () => {
    const owned = createPlan({ name: 'owned', ownerName: 'manager' });
    const unowned = createPlan({ name: 'unowned' });

    expect(getOwnedPlans([owned, unowned]).map((plan) => plan.metadata?.name)).toEqual(['owned']);
    expect(getOwnedPlans([unowned])).toEqual([]);
  });

  it('collects plan row ids in order, tolerating an empty list', () => {
    const plans = [
      createPlan({ name: 'plan-a', uid: 'uid-1' }),
      createPlan({ name: 'plan-b', namespace: 'ns1' }),
    ];

    expect(getPlanIds(plans)).toEqual(['uid-1', 'ns1/plan-b']);
    expect(getPlanIds([])).toEqual([]);
  });

  it('keeps only fulfilled plan ids and tolerates a short results array', () => {
    const plans = [
      createPlan({ name: 'plan-a', uid: 'uid-1' }),
      createPlan({ name: 'plan-b', uid: 'uid-2' }),
      createPlan({ name: 'plan-c', uid: 'uid-3' }),
    ];
    const results: PromiseSettledResult<unknown>[] = [
      { status: 'fulfilled', value: undefined },
      { reason: new Error('boom'), status: 'rejected' },
      { status: 'fulfilled', value: undefined },
    ];

    expect(getSucceededPlanIds(plans, results)).toEqual(['uid-1', 'uid-3']);
    expect(getSucceededPlanIds(plans, results.slice(0, 2))).toEqual(['uid-1']);
    expect(getSucceededPlanIds(plans, [])).toEqual([]);
  });

  it('builds archive patch with project ADD/REPLACE constants', () => {
    expect(buildArchivePlanPatch(createPlan({ name: 'new' }))).toEqual([
      { op: ADD, path: '/spec/archived', value: true },
    ]);
    expect(buildArchivePlanPatch(createPlan({ archived: true, name: 'existing' }))).toEqual([
      { op: REPLACE, path: '/spec/archived', value: true },
    ]);
  });
});

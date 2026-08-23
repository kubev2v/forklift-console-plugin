import { mockI18n } from '@test-utils/mockI18n';

mockI18n();

import { PlanStatuses } from 'src/plans/details/components/PlanStatus/utils/types';

import { describe, expect, it } from '@jest/globals';

import {
  canSelectPlanForBulkActions,
  getPlansEligibleForArchive,
  getPlansEligibleForDelete,
  hasNonArchivedSelectedPlans,
  isPlanRunningOrPending,
} from '../utils';

import { createPlan } from './bulkPlanActionsUtils.fixtures';

describe('BulkPlanActions utils - eligibility', () => {
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
});

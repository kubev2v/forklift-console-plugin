import type { IoK8sApiBatchV1Job } from '@forklift-ui/types';
import { describe, expect, it } from '@jest/globals';
import { CATEGORY_TYPES, CONDITION_STATUS, PHASES, taskStatuses } from '@utils/constants';

import { getJobPhase } from '../utils';

const createJob = (overrides: Partial<IoK8sApiBatchV1Job['status']> = {}): IoK8sApiBatchV1Job => ({
  status: {
    conditions: [],
    failed: undefined,
    succeeded: undefined,
    ...overrides,
  },
});

describe('getJobPhase', () => {
  it('returns Error when failed > 0', () => {
    const job = createJob({ failed: 1 });

    expect(getJobPhase(job)).toBe(taskStatuses.error);
  });

  it('returns Completed when condition type is Complete', () => {
    const job = createJob({
      conditions: [{ status: CONDITION_STATUS.TRUE, type: PHASES.COMPLETE }],
    });

    expect(getJobPhase(job)).toBe(taskStatuses.completed);
  });

  it('returns Completed when condition type is SuccessCriteriaMet', () => {
    const job = createJob({
      conditions: [{ status: CONDITION_STATUS.TRUE, type: CATEGORY_TYPES.CRITERIA_MET }],
    });

    expect(getJobPhase(job)).toBe(taskStatuses.completed);
  });

  it('returns Completed when both Complete and SuccessCriteriaMet are present', () => {
    const job = createJob({
      conditions: [
        { status: CONDITION_STATUS.TRUE, type: CATEGORY_TYPES.CRITERIA_MET },
        { status: CONDITION_STATUS.TRUE, type: PHASES.COMPLETE },
      ],
    });

    expect(getJobPhase(job)).toBe(taskStatuses.completed);
  });

  it('returns Pending when Complete condition status is False', () => {
    const job = createJob({
      conditions: [{ status: CONDITION_STATUS.FALSE, type: PHASES.COMPLETE }],
    });

    expect(getJobPhase(job)).toBe(taskStatuses.pending);
  });

  it('returns Pending when no conditions exist', () => {
    const job = createJob();

    expect(getJobPhase(job)).toBe(taskStatuses.pending);
  });

  it('returns Pending when conditions is undefined', () => {
    const job = createJob({ conditions: undefined });

    expect(getJobPhase(job)).toBe(taskStatuses.pending);
  });

  it('prioritizes Error over Completed', () => {
    const job = createJob({
      conditions: [{ status: CONDITION_STATUS.TRUE, type: PHASES.COMPLETE }],
      failed: 1,
    });

    expect(getJobPhase(job)).toBe(taskStatuses.error);
  });
});

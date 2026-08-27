import type {
  V1beta1PlanStatusMigrationVms,
  V1beta1PlanStatusMigrationVmsConditions,
} from '@forklift-ui/types';
import { describe, expect, it } from '@jest/globals';
import { mockI18n } from '@test-utils/mockI18n';
import { CATEGORY_TYPES, CONDITION_STATUS, taskStatuses } from '@utils/constants';

mockI18n();

import { getVMMigrationStatus } from '../utils';

const condition = (
  type: string,
  status: string = CONDITION_STATUS.TRUE,
): V1beta1PlanStatusMigrationVmsConditions => ({
  category: 'Advisory',
  lastTransitionTime: '2024-01-01T00:00:00Z',
  status,
  type,
});

const vm = (
  overrides: Partial<V1beta1PlanStatusMigrationVms> = {},
): V1beta1PlanStatusMigrationVms =>
  ({
    pipeline: [{ phase: taskStatuses.running }],
    ...overrides,
  }) as V1beta1PlanStatusMigrationVms;

describe('getVMMigrationStatus', () => {
  it('returns Failed when Failed condition is True', () => {
    expect(
      getVMMigrationStatus(
        vm({
          conditions: [condition(CATEGORY_TYPES.FAILED)],
        }),
      ),
    ).toBe('Failed');
  });

  it('returns Succeeded when Succeeded condition is True', () => {
    expect(
      getVMMigrationStatus(
        vm({
          conditions: [condition(CATEGORY_TYPES.SUCCEEDED)],
        }),
      ),
    ).toBe('Succeeded');
  });

  it('prefers Failed over Succeeded when both True', () => {
    expect(
      getVMMigrationStatus(
        vm({
          conditions: [condition(CATEGORY_TYPES.FAILED), condition(CATEGORY_TYPES.SUCCEEDED)],
        }),
      ),
    ).toBe('Failed');
  });

  it('returns Waiting when VM phase is CopyingPaused', () => {
    expect(getVMMigrationStatus(vm({ phase: 'CopyingPaused' }))).toBe('Waiting');
  });

  it('returns NotStarted when first pipeline step is Pending', () => {
    expect(getVMMigrationStatus(vm({ pipeline: [{ phase: taskStatuses.pending }] }))).toBe(
      'NotStarted',
    );
  });

  it('returns Running when started and not completed', () => {
    expect(
      getVMMigrationStatus(
        vm({ completed: undefined, pipeline: [{ phase: taskStatuses.running }], started: 't0' }),
      ),
    ).toBe('Running');
  });

  it('returns Unknown for completed migrations without success/fail conditions', () => {
    expect(
      getVMMigrationStatus(
        vm({ completed: 't1', pipeline: [{ phase: taskStatuses.completed }], started: 't0' }),
      ),
    ).toBe('Unknown');
  });

  it('returns Unknown when statusVM is undefined', () => {
    expect(getVMMigrationStatus(undefined)).toBe('Unknown');
  });

  it('throws when statusVM exists but pipeline is missing', () => {
    expect(() => getVMMigrationStatus({} as V1beta1PlanStatusMigrationVms)).toThrow();
  });
});

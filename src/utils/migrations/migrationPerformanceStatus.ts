import { CATEGORY_TYPES, CONDITION_STATUS } from '@utils/constants';
import { isEmpty } from '@utils/helpers';

import {
  MIGRATION_PERFORMANCE_STATUS,
  type MigrationPerformanceStatus,
} from './migrationPerformanceConstants';
import { toMilliseconds } from './migrationPerformanceTime';
import type { MigrationSource, MigrationVmSource, VmCondition } from './migrationPerformanceTypes';

const hasCondition = (conditions: VmCondition[] | undefined, type: string): boolean =>
  (conditions ?? []).some(
    (condition) => condition.type === type && condition.status === CONDITION_STATUS.TRUE,
  );

export const getConditionTime = (source: MigrationSource, type: string): number | undefined =>
  toMilliseconds(
    (source.conditions ?? []).find(
      (condition) => condition.type === type && condition.status === CONDITION_STATUS.TRUE,
    )?.lastTransitionTime,
  );

export const getVmStatus = (vm: MigrationVmSource, now: number): MigrationPerformanceStatus => {
  if (hasCondition(vm.conditions, CATEGORY_TYPES.SUCCEEDED)) {
    return MIGRATION_PERFORMANCE_STATUS.SUCCEEDED;
  }

  if (hasCondition(vm.conditions, CATEGORY_TYPES.FAILED)) {
    return MIGRATION_PERFORMANCE_STATUS.FAILED;
  }

  if (hasCondition(vm.conditions, CATEGORY_TYPES.CANCELED)) {
    return MIGRATION_PERFORMANCE_STATUS.CANCELED;
  }

  const started = toMilliseconds(vm.started);

  return started !== undefined && started <= now
    ? MIGRATION_PERFORMANCE_STATUS.RUNNING
    : MIGRATION_PERFORMANCE_STATUS.PENDING;
};

export const getOverallStatus = (
  source: MigrationSource,
  now: number,
): MigrationPerformanceStatus => {
  const statuses = (source.vms ?? []).map((vm) => getVmStatus(vm, now));
  const count = (status: MigrationPerformanceStatus): number =>
    statuses.filter((value) => value === status).length;
  const succeeded = count(MIGRATION_PERFORMANCE_STATUS.SUCCEEDED);
  const failed = count(MIGRATION_PERFORMANCE_STATUS.FAILED);
  const canceled = count(MIGRATION_PERFORMANCE_STATUS.CANCELED);
  const pending = count(MIGRATION_PERFORMANCE_STATUS.PENDING);

  if (
    (source.conditions ?? []).some(
      (condition) =>
        condition.type === CATEGORY_TYPES.CANCELED && condition.status === CONDITION_STATUS.TRUE,
    )
  ) {
    return MIGRATION_PERFORMANCE_STATUS.CANCELED;
  }

  if (count(MIGRATION_PERFORMANCE_STATUS.RUNNING) > 0) {
    return MIGRATION_PERFORMANCE_STATUS.RUNNING;
  }

  if (!source.completed && pending > 0 && (failed > 0 || succeeded > 0)) {
    return MIGRATION_PERFORMANCE_STATUS.RUNNING;
  }

  if (failed > 0 && succeeded > 0) {
    return MIGRATION_PERFORMANCE_STATUS.PARTIAL;
  }

  if (failed > 0) {
    return MIGRATION_PERFORMANCE_STATUS.FAILED;
  }

  if (canceled > 0) {
    return MIGRATION_PERFORMANCE_STATUS.CANCELED;
  }

  if (!isEmpty(statuses) && succeeded === statuses.length) {
    return MIGRATION_PERFORMANCE_STATUS.SUCCEEDED;
  }

  return MIGRATION_PERFORMANCE_STATUS.PENDING;
};

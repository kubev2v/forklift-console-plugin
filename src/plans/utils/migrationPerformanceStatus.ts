import { CATEGORY_TYPES, CONDITION_STATUS } from '@utils/constants';
import { isEmpty } from '@utils/helpers';

import { toMilliseconds } from './migrationPerformanceTime';
import type {
  MigrationPerformanceStatus,
  MigrationSource,
  MigrationVmSource,
  VmCondition,
} from './migrationPerformanceTypes';

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

export const getVmStatus = (vm: MigrationVmSource, now: number): string => {
  if (hasCondition(vm.conditions, CATEGORY_TYPES.SUCCEEDED)) {
    return 'Succeeded';
  }

  if (hasCondition(vm.conditions, CATEGORY_TYPES.FAILED)) {
    return 'Failed';
  }

  if (hasCondition(vm.conditions, CATEGORY_TYPES.CANCELED)) {
    return 'Canceled';
  }

  const started = toMilliseconds(vm.started);

  return started !== undefined && started <= now ? 'Running' : 'Pending';
};

export const getOverallStatus = (
  vms: MigrationVmSource[],
  now: number,
): MigrationPerformanceStatus => {
  const statuses = vms.map((vm) => getVmStatus(vm, now));
  const succeeded = statuses.filter((status) => status === 'Succeeded').length;
  const failed = statuses.filter((status) => status === 'Failed').length;
  const canceled = statuses.filter((status) => status === 'Canceled').length;

  if (failed > 0 && succeeded > 0) {
    return 'Partial';
  }

  if (failed > 0) {
    return 'Failed';
  }

  if (canceled > 0) {
    return 'Canceled';
  }

  if (!isEmpty(statuses) && succeeded === statuses.length) {
    return 'Succeeded';
  }

  return 'Running';
};

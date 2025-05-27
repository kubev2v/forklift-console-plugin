import type { V1beta1Plan, V1beta1PlanStatusMigrationVms } from '@kubev2v/types';
import { CATEGORY_TYPES, CONDITION_STATUS } from '@utils/constants';
import { getPlanIsWarm } from '@utils/crds/plans/selectors';
import { isEmpty } from '@utils/helpers';

import {
  type MigrationVirtualMachinesStatusesCounts,
  MigrationVirtualMachineStatusIcon,
  PlanStatuses,
} from './types';

const emptyCount: MigrationVirtualMachinesStatusesCounts = {
  [MigrationVirtualMachineStatusIcon.Canceled]: 0,
  [MigrationVirtualMachineStatusIcon.CantStart]: 0,
  [MigrationVirtualMachineStatusIcon.Failed]: 0,
  [MigrationVirtualMachineStatusIcon.InProgress]: 0,
  [MigrationVirtualMachineStatusIcon.Paused]: 0,
  [MigrationVirtualMachineStatusIcon.Succeeded]: 0,
};

export const getVMStatusIcon = (
  vm?: V1beta1PlanStatusMigrationVms,
): MigrationVirtualMachineStatusIcon | null => {
  const conditions = vm?.conditions ?? [];

  const isCanceled = conditions.some(
    (condition) =>
      condition.type === CATEGORY_TYPES.CANCELED && condition.status === CONDITION_STATUS.TRUE,
  );
  if (isCanceled) return MigrationVirtualMachineStatusIcon.Canceled;

  const isSucceeded = conditions.some(
    (condition) =>
      condition.type === CATEGORY_TYPES.SUCCEEDED && condition.status === CONDITION_STATUS.TRUE,
  );
  if (isSucceeded) return MigrationVirtualMachineStatusIcon.Succeeded;

  if (vm?.error) return MigrationVirtualMachineStatusIcon.Failed;

  if (vm?.started && !vm?.completed && !vm?.error) {
    return MigrationVirtualMachineStatusIcon.InProgress;
  }

  return null;
};

export const getMigrationVMsStatusCounts = (
  vms: V1beta1PlanStatusMigrationVms[],
  phase: PlanStatuses,
  planSpecVMsTotal: number,
): MigrationVirtualMachinesStatusesCounts => {
  if (PlanStatuses.CannotStart === phase) {
    return {
      ...emptyCount,
      [MigrationVirtualMachineStatusIcon.CantStart]: planSpecVMsTotal,
    };
  }

  if (PlanStatuses.Paused === phase) {
    return {
      ...emptyCount,
      [MigrationVirtualMachineStatusIcon.Paused]: planSpecVMsTotal,
    };
  }
  const counts: MigrationVirtualMachinesStatusesCounts = vms.reduce(
    (acc, vm) => {
      const status = getVMStatusIcon(vm);
      if (status) {
        acc[status] += 1;
      }
      return acc;
    },
    { ...emptyCount },
  );

  return counts;
};

const getConditions = (plan: V1beta1Plan) =>
  (plan?.status?.conditions ?? [])
    ?.filter((condition) => condition.status === CONDITION_STATUS.TRUE)
    .map((condition) => condition.type);

export const isPlanExecuting = (plan: V1beta1Plan) => {
  const conditions = getConditions(plan);

  return conditions?.includes(PlanStatuses.Executing);
};

export const isPlanArchived = (plan: V1beta1Plan) => {
  const conditions = getConditions(plan);
  return (
    (plan?.spec?.archived && !conditions.includes(PlanStatuses.Archived)) ?? // Archiving
    conditions.includes(PlanStatuses.Archived)
  );
};

export const getPlanStatus = (plan: V1beta1Plan): PlanStatuses => {
  if (!plan) return PlanStatuses.Unknown;

  const conditions = getConditions(plan);

  if (isEmpty(conditions)) {
    return PlanStatuses.Unknown;
  }

  if (plan?.spec?.archived || conditions.includes(PlanStatuses.Archived)) {
    return PlanStatuses.Archived;
  }

  if (conditions.includes(CATEGORY_TYPES.SUCCEEDED)) {
    return PlanStatuses.Completed;
  }

  if (conditions.includes(CATEGORY_TYPES.CANCELED)) {
    return PlanStatuses.Canceled;
  }

  const isCritical = plan?.status?.conditions?.find(
    (condition) =>
      condition.category === CATEGORY_TYPES.CRITICAL && condition.status === CONDITION_STATUS.TRUE,
  );

  if (isCritical) {
    return PlanStatuses.CannotStart;
  }

  const vmError = plan?.status?.migration?.vms?.find((vm) => vm?.error);

  if (conditions.includes(CATEGORY_TYPES.FAILED) || vmError) {
    return PlanStatuses.Incomplete;
  }

  const isWaitingForCutover = getPlanIsWarm(plan) && isPlanExecuting(plan) && !isPlanArchived(plan);

  if (isWaitingForCutover) {
    return PlanStatuses.Paused;
  }

  if (isPlanExecuting(plan)) {
    return PlanStatuses.Executing;
  }

  if (conditions.includes(PlanStatuses.Ready)) {
    return PlanStatuses.Ready;
  }

  return PlanStatuses.Unknown;
};

export const canPlanStart = (plan: V1beta1Plan) => {
  const conditions = getConditions(plan);

  return (
    conditions?.includes(CATEGORY_TYPES.READY) &&
    !conditions?.includes(CATEGORY_TYPES.EXECUTING) &&
    !conditions?.includes(CATEGORY_TYPES.SUCCEEDED) &&
    !plan?.spec?.archived
  );
};

export const canPlanReStart = (plan: V1beta1Plan) => {
  const conditions = getConditions(plan);

  return (
    conditions?.includes(CATEGORY_TYPES.FAILED) ?? conditions?.includes(CATEGORY_TYPES.CANCELED)
  );
};

export const isPlanSucceeded = (plan: V1beta1Plan) => {
  const conditions = getConditions(plan);

  return conditions?.includes(CATEGORY_TYPES.SUCCEEDED);
};

export const isPlanEditable = (plan: V1beta1Plan) => {
  const status = getPlanStatus(plan);
  return (
    status === PlanStatuses.Ready ||
    status === PlanStatuses.Canceled ||
    status === PlanStatuses.Incomplete ||
    status === PlanStatuses.Unknown
  );
};

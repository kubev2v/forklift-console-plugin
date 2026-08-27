import { isMigrationVirtualMachinePaused } from 'src/plans/details/utils/utils';

import type { V1beta1Plan, V1beta1PlanSpecVms } from '@forklift-ui/types';
import { CATEGORY_TYPES, CONDITION_STATUS } from '@utils/constants';
import { getPlanIsWarm, getPlanVirtualMachinesMigrationStatus } from '@utils/crds/plans/selectors';
import { isEmpty } from '@utils/helpers';
import type { TargetPowerStateValue } from '@utils/plans/constants';

import {
  PLAN_CONDITION_VALIDATING_VDDK,
  PLAN_CONDITION_VDDK_INIT_IMAGE_NOT_READY,
} from './constants';
import { PlanStatuses } from './types';

export const getVmTargetPowerState = (vm: V1beta1PlanSpecVms): TargetPowerStateValue =>
  vm?.targetPowerState;

export const getPlanConditions = (plan: V1beta1Plan): string[] =>
  (plan?.status?.conditions ?? [])
    ?.filter((condition) => condition.status === CONDITION_STATUS.TRUE)
    .map((condition) => condition.type);

export const isPlanExecuting = (plan: V1beta1Plan): boolean => {
  const conditions = getPlanConditions(plan);

  return conditions?.includes(PlanStatuses.Executing);
};

const isPlanWaitingForCutover = (plan: V1beta1Plan): boolean =>
  Boolean(
    getPlanVirtualMachinesMigrationStatus(plan).some(isMigrationVirtualMachinePaused) &&
    isPlanExecuting(plan) &&
    getPlanIsWarm(plan),
  );

const isPlanPendingExecution = (plan: V1beta1Plan): boolean => {
  if (!isPlanExecuting(plan)) {
    return false;
  }

  const vms = getPlanVirtualMachinesMigrationStatus(plan);

  return isEmpty(vms) || vms.every((vm) => !vm?.started);
};

export const isPlanArchived = (plan: V1beta1Plan): boolean => {
  const conditions = plan.status?.conditions;
  const hasArchivedCondition = (conditions ?? []).some(
    (condition) => condition.type === (PlanStatuses.Archived as string),
  );
  return Boolean(plan?.spec?.archived) || hasArchivedCondition;
};

export const getPlanStatus = (plan: V1beta1Plan): PlanStatuses => {
  if (!plan) {
    return PlanStatuses.Unknown;
  }

  const conditions = getPlanConditions(plan);

  if (plan?.spec?.archived || conditions.includes(PlanStatuses.Archived)) {
    return PlanStatuses.Archived;
  }

  if (isEmpty(conditions)) {
    return PlanStatuses.Unknown;
  }

  if (conditions.includes(CATEGORY_TYPES.SUCCEEDED)) {
    return PlanStatuses.Completed;
  }

  if (conditions.includes(CATEGORY_TYPES.CANCELED)) {
    return PlanStatuses.Canceled;
  }

  if (isPlanWaitingForCutover(plan)) {
    return PlanStatuses.Paused;
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

  if (isPlanPendingExecution(plan)) {
    return PlanStatuses.Pending;
  }

  if (isPlanExecuting(plan)) {
    return PlanStatuses.Executing;
  }

  if (conditions.includes(PlanStatuses.Ready)) {
    return PlanStatuses.Ready;
  }

  if (
    conditions.includes(PLAN_CONDITION_VALIDATING_VDDK) ||
    conditions.includes(PLAN_CONDITION_VDDK_INIT_IMAGE_NOT_READY)
  ) {
    return PlanStatuses.Validating;
  }

  return PlanStatuses.Unknown;
};

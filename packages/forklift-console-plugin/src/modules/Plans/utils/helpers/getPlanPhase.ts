import { V1beta1Plan } from '@kubev2v/types';

import { PlanData, PlanPhase } from '../types';
import { PlanConditionType } from '../types/PlanCondition';

import { getConditionTypes } from './getConditionTypes';

export const getPlanPhase = (data: PlanData): PlanPhase => {
  const plan = data?.obj;

  if (!plan) return PlanPhase.Unknown;

  // Check condition type
  const conditionTypes = getConditionTypes(plan);

  if (!Object.keys(conditionTypes).length) {
    return PlanPhase.Unknown;
  }

  // Check for Archived
  if (plan?.spec?.archived || conditionTypes[PlanConditionType.Archived]) {
    return PlanPhase.Archived;
  }

  // Check for Succeeded
  if (conditionTypes[PlanConditionType.Succeeded]) {
    return PlanPhase.Succeeded;
  }

  // Check for Canceled
  if (conditionTypes[PlanConditionType.Canceled]) {
    return PlanPhase.Canceled;
  }

  // CHeck for Running
  if (conditionTypes[PlanConditionType.Executing]) {
    return PlanPhase.Running;
  }

  // Check condition category
  const isCritical = plan?.status?.conditions?.find(
    (c) => c.category === 'Critical' && c.status === 'True',
  );

  if (isCritical) {
    return PlanPhase.Error;
  }

  // Check for vm errors
  const vmError = plan?.status?.migration?.vms?.find((vm) => vm?.error);

  if (conditionTypes[PlanConditionType.Failed]) {
    return PlanPhase.Failed;
  }

  if (vmError) {
    return PlanPhase.vmError;
  }

  // Check condition category
  const isWarn = plan?.status?.conditions?.find(
    (c) => c.category === 'Warn' && c.status === 'True',
  );

  if (isWarn) {
    return PlanPhase.Warning;
  }

  if (conditionTypes[PlanConditionType.Ready]) {
    return PlanPhase.Ready;
  }

  return PlanPhase.NotReady;
};

export const canPlanStart = (plan: V1beta1Plan) => {
  const conditionTypes = getConditionTypes(plan);

  return (
    conditionTypes[PlanConditionType.Ready] &&
    !conditionTypes[PlanConditionType.Executing] &&
    !conditionTypes[PlanConditionType.Succeeded] &&
    !plan?.spec?.archived
  );
};

export const canPlanReStart = (plan: V1beta1Plan) => {
  const conditionTypes = getConditionTypes(plan);

  return conditionTypes[PlanConditionType.Failed] || conditionTypes[PlanConditionType.Canceled];
};

export const isPlanExecuting = (plan: V1beta1Plan) => {
  const conditionTypes = getConditionTypes(plan);

  return conditionTypes[PlanConditionType.Executing];
};

export const isPlanSucceeded = (plan: V1beta1Plan) => {
  const conditionTypes = getConditionTypes(plan);

  return conditionTypes[PlanConditionType.Succeeded];
};

export const isPlanEditable = (plan: V1beta1Plan) => {
  const planStatus = getPlanPhase({ obj: plan });

  return (
    planStatus === PlanPhase.Unknown ||
    planStatus === PlanPhase.Canceled ||
    planStatus === PlanPhase.Error ||
    planStatus === PlanPhase.Failed ||
    planStatus === PlanPhase.vmError ||
    planStatus === PlanPhase.Warning ||
    planStatus === PlanPhase.Ready
  );
};

export const isPlanArchived = (plan: V1beta1Plan) => {
  const planStatus = getPlanPhase({ obj: plan });

  return planStatus === PlanPhase.Archived;
};

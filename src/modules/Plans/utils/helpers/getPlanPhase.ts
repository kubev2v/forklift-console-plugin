import type { V1beta1Plan } from '@kubev2v/types';

import { type PlanData, PlanPhase } from '../types';

export const getPlanPhase = (data: PlanData): PlanPhase => {
  const plan = data?.obj;
  if (!plan) return PlanPhase.Unknown;

  // Check condition type
  const conditions = getConditions(plan);

  if (!conditions || conditions?.length < 1) {
    return PlanPhase.Unknown;
  }

  // Check for Archived
  if (plan?.spec?.archived && !conditions.includes('Archived')) {
    return PlanPhase.Archiving;
  }

  if (conditions.includes('Archived')) {
    return PlanPhase.Archived;
  }

  // Check for Succeeded
  if (conditions.includes('Succeeded')) {
    return PlanPhase.Succeeded;
  }

  // Check for Canceled
  if (conditions.includes('Canceled')) {
    return PlanPhase.Canceled;
  }

  // CHeck for Running
  if (conditions.includes('Executing')) {
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

  if (conditions.includes('Failed')) {
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

  if (conditions.includes('Ready')) {
    return PlanPhase.Ready;
  }

  return PlanPhase.NotReady;
};

export const canPlanStart = (plan: V1beta1Plan) => {
  const conditions = getConditions(plan);

  return (
    conditions?.includes('Ready') &&
    !conditions?.includes('Executing') &&
    !conditions?.includes('Succeeded') &&
    !plan?.spec?.archived
  );
};

export const canPlanReStart = (plan: V1beta1Plan) => {
  const conditions = getConditions(plan);

  return conditions?.includes('Failed') || conditions?.includes('Canceled');
};

export const isPlanExecuting = (plan: V1beta1Plan) => {
  const conditions = getConditions(plan);

  return conditions?.includes('Executing');
};

export const isPlanSucceeded = (plan: V1beta1Plan) => {
  const conditions = getConditions(plan);

  return conditions?.includes('Succeeded');
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

  return planStatus === PlanPhase.Archiving || planStatus === PlanPhase.Archived;
};

const getConditions = (obj: V1beta1Plan) =>
  obj?.status?.conditions?.filter((c) => c.status === 'True').map((c) => c.type);

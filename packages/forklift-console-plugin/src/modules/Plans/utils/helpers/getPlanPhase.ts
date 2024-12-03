import { V1beta1Plan } from '@kubev2v/types';

import { PlanData, PlanPhase } from '../types';

export const getPlanPhase = (data: PlanData): PlanPhase => {
  const plan = data?.obj;

  if (!plan) return 'Unknown';

  // Check condition type
  const conditions = getConditions(plan);

  if (!conditions || conditions?.length < 1) {
    return 'Unknown';
  }

  // Check for Archived
  if (plan?.spec?.archived && !conditions.includes('Archived')) {
    return 'Archiving';
  }

  if (conditions.includes('Archived')) {
    return 'Archived';
  }

  // Check for Succeeded
  if (conditions.includes('Succeeded')) {
    return 'Succeeded';
  }

  // Check for Canceled
  if (conditions.includes('Canceled')) {
    return 'Canceled';
  }

  // CHeck for Running
  if (conditions.includes('Executing')) {
    return 'Running';
  }

  // Check condition category
  const isCritical = plan?.status?.conditions?.find(
    (c) => c.category === 'Critical' && c.status === 'True',
  );

  if (isCritical) {
    return 'Error';
  }

  // Check for vm errors
  const vmError = plan?.status?.migration?.vms?.find((vm) => vm?.error);

  if (conditions.includes('Failed')) {
    return 'Failed';
  }

  if (vmError) {
    return 'vmError';
  }

  // Check condition category
  const isWarn = plan?.status?.conditions?.find(
    (c) => c.category === 'Warn' && c.status === 'True',
  );

  if (isWarn) {
    return 'Warning';
  }

  if (conditions.includes('Ready')) {
    return 'Ready';
  }

  return 'NotReady';
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
    planStatus === 'Unknown' ||
    planStatus === 'Canceled' ||
    planStatus === 'Error' ||
    planStatus === 'Failed' ||
    planStatus === 'vmError' ||
    planStatus === 'Warning' ||
    planStatus === 'Ready'
  );
};

export const isPlanArchived = (plan: V1beta1Plan) => {
  const planStatus = getPlanPhase({ obj: plan });

  return planStatus === 'Archiving' || planStatus === 'Archived';
};

const getConditions = (obj: V1beta1Plan) =>
  obj?.status?.conditions?.filter((c) => c.status === 'True').map((c) => c.type);

import { V1beta1Plan } from '@kubev2v/types';

import { PlanData, PlanPhase } from '../types';

export const getPlanPhase = (data: PlanData): PlanPhase => {
  const plan = data?.obj;

  if (!plan) return 'Unknown';

  // Check condition category
  const isCritical = plan?.status?.conditions?.find(
    (c) => c.category === 'Critical' && c.status === 'True',
  );

  if (isCritical) {
    return 'Error';
  }

  // Check condition category
  const isWarn = plan?.status?.conditions?.find(
    (c) => c.category === 'Warn' && c.status === 'True',
  );

  if (isWarn) {
    return 'Warning';
  }

  // Check for vm errors
  const vmError = plan?.status?.migration?.vms?.find((vm) => vm?.error);

  // Check condition type
  const conditions = getConditions(plan);

  if (!conditions || conditions?.length < 1) {
    return 'Unknown';
  }

  if (conditions.includes('Archived')) {
    return 'Archived';
  }

  if (conditions.includes('Failed')) {
    return 'Failed';
  }

  if (vmError) {
    return 'vmError';
  }

  if (conditions.includes('Canceled')) {
    return 'Canceled';
  }

  if (conditions.includes('Succeeded')) {
    return 'Succeeded';
  }

  if (conditions.includes('Executing')) {
    return 'Running';
  }

  if (conditions.includes('Ready')) {
    return 'Ready';
  }

  return 'NotReady';
};

const getConditions = (obj: V1beta1Plan) =>
  obj?.status?.conditions?.filter((c) => c.status === 'True').map((c) => c.type);

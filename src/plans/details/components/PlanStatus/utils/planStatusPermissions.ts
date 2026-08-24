import type { V1beta1Plan } from '@forklift-ui/types';
import { CATEGORY_TYPES, CONDITION_STATUS } from '@utils/constants';

import { PLAN_CONDITION_CONVERSION_RESUMABLE } from './constants';
import { getPlanConditions, getPlanStatus } from './planStatusResolver';
import { PlanStatuses } from './types';

export const canPlanStart = (plan: V1beta1Plan): boolean => {
  const conditions = getPlanConditions(plan);

  return (
    conditions?.includes(CATEGORY_TYPES.READY) &&
    !conditions?.includes(CATEGORY_TYPES.EXECUTING) &&
    !conditions?.includes(CATEGORY_TYPES.SUCCEEDED) &&
    !plan?.spec?.archived
  );
};

export const canPlanReStart = (plan: V1beta1Plan): boolean => {
  const conditions = getPlanConditions(plan);

  return (
    conditions?.includes(CATEGORY_TYPES.FAILED) ?? conditions?.includes(CATEGORY_TYPES.CANCELED)
  );
};

export const canPlanResumeConversion = (plan: V1beta1Plan): boolean => {
  return (
    plan?.status?.conditions?.some(
      (condition) =>
        condition.type === PLAN_CONDITION_CONVERSION_RESUMABLE &&
        condition.status === CONDITION_STATUS.TRUE,
    ) ?? false
  );
};

export const isPlanSucceeded = (plan: V1beta1Plan): boolean => {
  const conditions = getPlanConditions(plan);

  return conditions?.includes(CATEGORY_TYPES.SUCCEEDED);
};

export const isPlanEditable = (plan: V1beta1Plan): boolean => {
  const status = getPlanStatus(plan);
  return (
    status === PlanStatuses.Ready ||
    status === PlanStatuses.Canceled ||
    status === PlanStatuses.Incomplete ||
    status === PlanStatuses.Unknown ||
    status === PlanStatuses.CannotStart
  );
};

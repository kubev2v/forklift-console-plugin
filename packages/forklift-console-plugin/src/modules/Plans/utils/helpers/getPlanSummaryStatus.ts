import { PlanData, PlanSummaryStatus } from '../types';
import {
  PlanConditionCategory,
  PlanConditionStatus,
  PlanConditionType,
} from '../types/PlanCondition';

import { getConditionTypes } from './getConditionTypes';

export const getPlanSummaryStatus = (data: PlanData): PlanSummaryStatus => {
  const plan = data?.obj;
  const conditionTypes = getConditionTypes(plan);

  if (!Object.keys(conditionTypes)?.length) {
    return;
  }

  const {
    [PlanConditionType.Archived]: isArchived,
    [PlanConditionType.Canceled]: isCanceled,
    [PlanConditionType.Executing]: isExecuting,
    [PlanConditionType.Running]: isRunning,
    [PlanConditionType.Failed]: isFailed,
    [PlanConditionType.Succeeded]: isSucceeded,
    [PlanConditionType.Ready]: isReady,
  } = conditionTypes;

  // Archived
  if (plan?.spec?.archived || isArchived) {
    return PlanSummaryStatus.Archived;
  }

  // Canceled
  if (isCanceled) {
    return PlanSummaryStatus.Canceled;
  }

  // Running
  if (isExecuting || isRunning) {
    return PlanSummaryStatus.Running;
  }

  // Incomplete
  const hasVmError = !!plan?.status?.migration?.vms?.find((vm) => vm?.error);

  if (isFailed || hasVmError) {
    return PlanSummaryStatus.Incomplete;
  }

  // Cannot start
  const isCritical = plan?.status?.conditions?.find(
    (condition) =>
      condition.category === PlanConditionCategory.Critical &&
      condition.status === PlanConditionStatus.True,
  );
  const isWarn = plan?.status?.conditions?.find(
    (condition) =>
      condition.category === PlanConditionCategory.Warn &&
      condition.status === PlanConditionStatus.True,
  );

  if (isCritical || isWarn) {
    return PlanSummaryStatus.CannotStart;
  }

  // Complete
  if (isSucceeded) {
    return PlanSummaryStatus.Complete;
  }

  // Ready to start
  if (isReady) {
    return PlanSummaryStatus.ReadyToStart;
  }
};

import { PlanData, PlanSummaryStatus } from '../types';
import {
  PlanConditionCategory,
  PlanConditionStatus,
  PlanConditionType,
} from '../types/PlanCondition';

export const getPlanSummaryStatus = (data: PlanData): PlanSummaryStatus => {
  const plan = data?.obj;
  const conditionTypes = plan?.status?.conditions?.reduce((acc, condition) => {
    if (condition.status === PlanConditionStatus.True) {
      acc.push(condition.type);
    }

    return acc;
  }, []);

  if (!conditionTypes?.length) {
    return;
  }

  const isArchiving = plan?.spec?.archived && !conditionTypes.includes(PlanConditionType.Archived);

  // Archived
  if (isArchiving || conditionTypes.includes(PlanConditionType.Archived)) {
    return PlanSummaryStatus.Archived;
  }

  // Canceled
  if (conditionTypes.includes(PlanConditionType.Canceled)) {
    return PlanSummaryStatus.Canceled;
  }

  // Running
  if (
    conditionTypes.includes(PlanConditionType.Executing) ||
    conditionTypes.includes(PlanConditionType.Running)
  ) {
    return PlanSummaryStatus.Running;
  }

  // Incomplete
  const vmError = plan?.status?.migration?.vms?.find((vm) => vm?.error);

  if (conditionTypes.includes(PlanConditionType.Failed) || vmError) {
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
  if (conditionTypes.includes(PlanConditionType.Succeeded)) {
    return PlanSummaryStatus.Complete;
  }

  // Ready to start
  if (conditionTypes.includes(PlanConditionType.Ready)) {
    return PlanSummaryStatus.ReadyToStart;
  }
};

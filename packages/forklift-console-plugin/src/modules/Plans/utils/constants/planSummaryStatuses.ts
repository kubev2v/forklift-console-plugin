import { PlanSummaryStatus } from '../types';

export const planSummaryStatuses: { id: PlanSummaryStatus; label: PlanSummaryStatus }[] = [
  { id: PlanSummaryStatus.Archived, label: PlanSummaryStatus.Archived },
  { id: PlanSummaryStatus.Canceled, label: PlanSummaryStatus.Canceled },
  { id: PlanSummaryStatus.CannotStart, label: PlanSummaryStatus.CannotStart },
  { id: PlanSummaryStatus.Complete, label: PlanSummaryStatus.Complete },
  { id: PlanSummaryStatus.Incomplete, label: PlanSummaryStatus.Incomplete },
  { id: PlanSummaryStatus.ReadyToStart, label: PlanSummaryStatus.ReadyToStart },
  { id: PlanSummaryStatus.Running, label: PlanSummaryStatus.Running },
];

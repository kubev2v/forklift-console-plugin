import { ForkliftTFunction } from 'src/utils/i18n';

import { PlanSummaryStatus } from '../utils';

export const getStartActionDescription = (
  status: PlanSummaryStatus,
  isPlanValidating: boolean,
  t: ForkliftTFunction,
): string => {
  if (isPlanValidating) {
    return t('The plan is being validated');
  }

  switch (status) {
    case PlanSummaryStatus.Archived:
      return t('Archived plans cannot be started');
    case PlanSummaryStatus.Complete:
      return t('All VMs were migrated');
    case PlanSummaryStatus.Running:
      return t('The plan is currently in progress');
    case PlanSummaryStatus.CannotStart:
      return t('The plan cannot be started');
  }
};

export const getDuplicateActionDescription = (
  status: PlanSummaryStatus,
  isPlanValidating: boolean,
  t: ForkliftTFunction,
): string => {
  if (isPlanValidating) {
    return t('The plan is being validated');
  }

  if (status === PlanSummaryStatus.CannotStart) {
    return t('The plan cannot be duplicated');
  }
};

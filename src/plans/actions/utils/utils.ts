import { PlanStatuses } from 'src/plans/details/components/PlanStatus/utils/types';

import { t } from '@utils/i18n';

type StartDescriptionMap = Record<PlanStatuses, string | null>;

const partialStartDescription: Partial<StartDescriptionMap> = {
  [PlanStatuses.Archived]: t('Archived plans cannot be started'),
  [PlanStatuses.CannotStart]: t('The plan cannot be started'),
  [PlanStatuses.Completed]: t('All VMs were migrated'),
  [PlanStatuses.Executing]: t('The plan is currently in progress'),
  [PlanStatuses.Paused]: t('The plan is currently in progress'),
};

export const startDescription: StartDescriptionMap = Object.values(PlanStatuses).reduce(
  (acc, status) => {
    acc[status] = partialStartDescription[status] ?? null;
    return acc;
  },
  {} as StartDescriptionMap,
);

export const getDuplicateDescription = (planStatus: PlanStatuses): string | null => {
  if (planStatus === PlanStatuses.CannotStart) return t('The plan cannot be duplicated');
  return null;
};

export const getEditDescription = (planStatus: PlanStatuses): string | null => {
  if (planStatus === PlanStatuses.Executing || planStatus === PlanStatuses.Paused)
    return t('Plans cannot be modified during migration');
  if (planStatus === PlanStatuses.Archived) return t('Archived plans cannot be edited');
  return null;
};

import { MigrationTypeValue } from 'src/plans/create/steps/migration-type/constants';
import { PlanStatuses } from 'src/plans/details/components/PlanStatus/utils/types';

import { t } from '@utils/i18n';

export const planPhases: { id: PlanStatuses; label: string }[] = [
  { id: PlanStatuses.Archived, label: t('Archived') },
  { id: PlanStatuses.Canceled, label: t('Canceled') },
  { id: PlanStatuses.CannotStart, label: t('Cannot start') },
  { id: PlanStatuses.Completed, label: t('Complete') },
  { id: PlanStatuses.Executing, label: t('Running') },
  { id: PlanStatuses.Incomplete, label: t('Incomplete') },
  { id: PlanStatuses.Paused, label: t('Paused') },
  { id: PlanStatuses.Pending, label: t('Pending') },
  { id: PlanStatuses.Ready, label: t('Ready to start') },
  { id: PlanStatuses.Validating, label: t('Validating') },
];

export const migrationTypes: { id: MigrationTypeValue; label: string }[] = [
  { id: MigrationTypeValue.Warm, label: t('Warm') },
  { id: MigrationTypeValue.Cold, label: t('Cold') },
  { id: MigrationTypeValue.Live, label: t('Live') },
];

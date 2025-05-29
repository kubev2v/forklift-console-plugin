import {
  type MigrationVirtualMachinesStatusesCounts,
  MigrationVirtualMachineStatusIcon,
} from 'src/plans/details/components/PlanStatus/utils/types';
import { isMigrationVirtualMachinePaused } from 'src/plans/details/utils/utils';

import type { V1beta1PlanStatusMigrationVms } from '@kubev2v/types';
import { CATEGORY_TYPES, CONDITION_STATUS, taskStatuses } from '@utils/constants';
import { t } from '@utils/i18n';

export const getMigrationStatusIcon = (
  vmStatuses: MigrationVirtualMachinesStatusesCounts,
  migrationVMsCounts: number | undefined,
): MigrationVirtualMachineStatusIcon | null => {
  if (vmStatuses[MigrationVirtualMachineStatusIcon.Failed] > 0)
    return MigrationVirtualMachineStatusIcon.Failed;
  if (vmStatuses[MigrationVirtualMachineStatusIcon.Paused] > 0)
    return MigrationVirtualMachineStatusIcon.Paused;
  if (vmStatuses[MigrationVirtualMachineStatusIcon.Succeeded] === migrationVMsCounts)
    return MigrationVirtualMachineStatusIcon.Succeeded;

  return null;
};

export const getVMMigrationStatus = (statusVM: V1beta1PlanStatusMigrationVms | undefined) => {
  const isError = statusVM?.conditions?.find(
    (condition) =>
      condition.type === CATEGORY_TYPES.FAILED && condition.status === CONDITION_STATUS.TRUE,
  );
  const isSuccess = statusVM?.conditions?.find(
    (condition) =>
      condition.type === CATEGORY_TYPES.SUCCEEDED && condition.status === CONDITION_STATUS.TRUE,
  );

  const isRunning = statusVM?.completed === undefined;
  const notStarted = statusVM?.pipeline[0].phase === taskStatuses.pending;

  if (isError) {
    return t('Failed');
  }

  if (isSuccess) {
    return t('Succeeded');
  }

  if (isMigrationVirtualMachinePaused(statusVM)) {
    return t('Waiting');
  }

  if (notStarted) {
    return t('NotStarted');
  }

  if (isRunning) {
    return t('Running');
  }

  return t('Unknown');
};

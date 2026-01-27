import {
  type MigrationVirtualMachinesStatusesCounts,
  MigrationVirtualMachineStatus,
} from 'src/plans/details/components/PlanStatus/utils/types';
import { isMigrationVirtualMachinePaused } from 'src/plans/details/utils/utils';

import type { V1beta1PlanStatusMigrationVms } from '@forklift-ui/types';
import { CATEGORY_TYPES, CONDITION_STATUS, taskStatuses } from '@utils/constants';
import { t } from '@utils/i18n';

export const getMigrationStatusLabel = (
  vmStatuses: MigrationVirtualMachinesStatusesCounts,
  migrationVMsCounts: number | undefined,
): MigrationVirtualMachineStatus | null => {
  if (vmStatuses[MigrationVirtualMachineStatus.InProgress].count > 0)
    return MigrationVirtualMachineStatus.InProgress;
  if (vmStatuses[MigrationVirtualMachineStatus.Failed].count > 0)
    return MigrationVirtualMachineStatus.Failed;
  if (vmStatuses[MigrationVirtualMachineStatus.Paused].count > 0)
    return MigrationVirtualMachineStatus.Paused;
  if (vmStatuses[MigrationVirtualMachineStatus.Succeeded].count === migrationVMsCounts)
    return MigrationVirtualMachineStatus.Succeeded;

  return null;
};

export const getVMMigrationStatus = (statusVM: V1beta1PlanStatusMigrationVms | undefined) => {
  const isError = statusVM?.conditions?.find(
    (condition) =>
      condition.type === CATEGORY_TYPES.FAILED && condition.status === CONDITION_STATUS.TRUE,
  );

  if (isError) {
    return t('Failed');
  }

  const isSuccess = statusVM?.conditions?.find(
    (condition) =>
      condition.type === CATEGORY_TYPES.SUCCEEDED && condition.status === CONDITION_STATUS.TRUE,
  );

  if (isSuccess) {
    return t('Succeeded');
  }

  if (isMigrationVirtualMachinePaused(statusVM)) {
    return t('Waiting');
  }

  const notStarted = statusVM?.pipeline[0].phase === taskStatuses.pending;
  if (notStarted) {
    return t('NotStarted');
  }

  const isRunning = statusVM?.started !== undefined && statusVM?.completed === undefined;

  if (isRunning) {
    return t('Running');
  }

  return t('Unknown');
};

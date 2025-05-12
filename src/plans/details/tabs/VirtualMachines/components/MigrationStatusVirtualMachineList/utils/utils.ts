import type { V1beta1PlanStatusMigrationVms } from '@kubev2v/types';
import type { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { taskStatuses } from '@utils/constants';
import { t } from '@utils/i18n';

import type { MigrationStatusVirtualMachinePageData } from './types';

export const VIRTUAL_MACHINE_CREATION_NAME = 'VirtualMachineCreation';

export const getVMMigrationStatus = (obj: unknown) => {
  const vmMigrationStatusData = obj as MigrationStatusVirtualMachinePageData;
  const isError = vmMigrationStatusData.statusVM?.conditions?.find(
    (condition) => condition.type === 'Failed' && condition.status === 'True',
  );
  const isSuccess = vmMigrationStatusData.statusVM?.conditions?.find(
    (condition) => condition.type === 'Succeeded' && condition.status === 'True',
  );
  const isWaiting = vmMigrationStatusData.statusVM?.phase === 'CopyingPaused';
  const isRunning = vmMigrationStatusData.statusVM?.completed === undefined;
  const notStarted = vmMigrationStatusData.statusVM?.pipeline[0].phase === 'Pending';

  if (isError) {
    return t('Failed');
  }

  if (isSuccess) {
    return t('Succeeded');
  }

  if (isWaiting) {
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

export const isVirtualMachineCreationCompleted = (
  statusVM: V1beta1PlanStatusMigrationVms | undefined,
) => {
  const pipeline = statusVM?.pipeline ?? [];
  return pipeline.some(
    (pipe) =>
      pipe?.name === VIRTUAL_MACHINE_CREATION_NAME && pipe?.phase === taskStatuses.completed,
  );
};

export const getVMDiskTransferPipeline = (statusVM: V1beta1PlanStatusMigrationVms | undefined) => {
  const diskTransfer = statusVM?.pipeline.find((pipe) => pipe.name.startsWith('DiskTransfer'));
  return diskTransfer;
};

export const getVMDiskProgress = (obj: unknown) => {
  const vmMigrationStatusData = obj as MigrationStatusVirtualMachinePageData;
  const diskTransfer = getVMDiskTransferPipeline(vmMigrationStatusData.statusVM);

  return diskTransfer?.progress?.total
    ? diskTransfer?.progress?.completed / diskTransfer?.progress?.total
    : 0;
};

export const groupByVmId = <T extends K8sResourceCommon>(items: T[]) =>
  items.reduce<Record<string, T[]>>((acc, item) => {
    const vmID = item?.metadata?.labels?.vmID;
    if (vmID) {
      if (!acc[vmID]) acc[vmID] = [];

      acc[vmID].push(item);
    }
    return acc;
  }, {});

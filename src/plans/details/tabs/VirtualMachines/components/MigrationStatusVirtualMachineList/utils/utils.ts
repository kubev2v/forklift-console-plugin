import type {
  V1beta1PlanStatusMigrationVms,
  V1beta1PlanStatusMigrationVmsPipeline,
} from '@forklift-ui/types';
import type { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { taskStatuses } from '@utils/constants';
import { isEmpty } from '@utils/helpers';
import { t } from '@utils/i18n';

import type { MigrationStatusVirtualMachinePageData } from './types';

export const VIRTUAL_MACHINE_CREATION_NAME = 'VirtualMachineCreation';
export const CUTOVER_NAME = 'Cutover';
const DISK_ALLOCATION_NAME = 'DiskAllocation';
const DISK_TRANSFER_PREFIX = 'DiskTransfer';

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

const isDiskTransferStep = (pipe: V1beta1PlanStatusMigrationVmsPipeline): boolean =>
  pipe?.name?.startsWith(DISK_TRANSFER_PREFIX) || pipe?.name === DISK_ALLOCATION_NAME;

const isStepActive = (pipe: V1beta1PlanStatusMigrationVmsPipeline): boolean =>
  Boolean(pipe.phase) &&
  pipe.phase !== taskStatuses.pending &&
  pipe.phase !== taskStatuses.completed;

/**
 * Returns the pipeline step representing disk transfer progress.
 * For copy-offload migrations, actual transfer happens in DiskAllocation
 * while DiskTransferV2v runs instantly with no per-task progress.
 * Prefers the currently active step; falls back to the one with more progress.
 */
export const getVMDiskTransferPipeline = (
  statusVM: V1beta1PlanStatusMigrationVms | undefined,
): V1beta1PlanStatusMigrationVmsPipeline | undefined => {
  const pipeline = statusVM?.pipeline ?? [];
  const diskSteps = pipeline.filter(isDiskTransferStep);

  if (isEmpty(diskSteps)) return undefined;
  if (diskSteps.length === 1) return diskSteps[0];

  const running = diskSteps.find(isStepActive);
  if (running) return running;

  const diskTransfer = diskSteps.find((pipe) => pipe.name.startsWith(DISK_TRANSFER_PREFIX));
  const diskAllocation = diskSteps.find((pipe) => pipe.name === DISK_ALLOCATION_NAME);

  if ((diskTransfer?.progress?.completed ?? 0) > 0) return diskTransfer;
  if ((diskAllocation?.progress?.completed ?? 0) > 0) return diskAllocation;

  return diskTransfer ?? diskAllocation;
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

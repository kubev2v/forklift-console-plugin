import { isMigrationVirtualMachinePaused } from 'src/plans/details/utils/utils';

import type { V1beta1PlanSpecVms, V1beta1PlanStatusMigrationVms } from '@forklift-ui/types';
import { CATEGORY_TYPES, CONDITION_STATUS } from '@utils/constants';
import { deepCopy } from '@utils/deepCopy';

import {
  type MigrationVirtualMachinesStatusCountObjectVM,
  type MigrationVirtualMachinesStatusesCounts,
  MigrationVirtualMachineStatus,
  PlanStatuses,
} from './types';

export const emptyMigrationVmStatusCount: MigrationVirtualMachinesStatusesCounts = {
  [MigrationVirtualMachineStatus.Canceled]: {
    count: 0,
    vms: [],
  },
  [MigrationVirtualMachineStatus.CantStart]: {
    count: 0,
    vms: [],
  },
  [MigrationVirtualMachineStatus.Failed]: {
    count: 0,
    vms: [],
  },
  [MigrationVirtualMachineStatus.InProgress]: {
    count: 0,
    vms: [],
  },
  [MigrationVirtualMachineStatus.Paused]: {
    count: 0,
    vms: [],
  },
  [MigrationVirtualMachineStatus.Succeeded]: {
    count: 0,
    vms: [],
  },
};

export const getMigrationVMStatus = (
  vm?: V1beta1PlanStatusMigrationVms,
): MigrationVirtualMachineStatus | null => {
  const conditions = vm?.conditions ?? [];

  const isCanceled = conditions.some(
    (condition) =>
      condition.type === CATEGORY_TYPES.CANCELED && condition.status === CONDITION_STATUS.TRUE,
  );
  if (isCanceled) {
    return MigrationVirtualMachineStatus.Canceled;
  }

  const isSucceeded = conditions.some(
    (condition) =>
      condition.type === CATEGORY_TYPES.SUCCEEDED && condition.status === CONDITION_STATUS.TRUE,
  );
  if (isSucceeded) {
    return MigrationVirtualMachineStatus.Succeeded;
  }

  if (vm?.error) {
    return MigrationVirtualMachineStatus.Failed;
  }

  if (isMigrationVirtualMachinePaused(vm)) {
    return MigrationVirtualMachineStatus.Paused;
  }

  if (vm?.started && !vm?.completed && !vm?.error) {
    return MigrationVirtualMachineStatus.InProgress;
  }

  return null;
};

export const getCantStartVMStatusCount = (
  vms: V1beta1PlanSpecVms[],
): MigrationVirtualMachinesStatusesCounts => {
  return {
    ...emptyMigrationVmStatusCount,
    [MigrationVirtualMachineStatus.CantStart]: {
      count: vms.length,
      vms: vms.map((vm) => ({ name: String(vm.name) })),
    },
  };
};

export const getMigrationVMsStatusCounts = (
  vms: V1beta1PlanStatusMigrationVms[],
  planSpecVMsTotal: number,
  phase?: PlanStatuses,
): MigrationVirtualMachinesStatusesCounts => {
  if (PlanStatuses.Paused === phase) {
    return {
      ...emptyMigrationVmStatusCount,
      [MigrationVirtualMachineStatus.Paused]: {
        count: planSpecVMsTotal,
        vms: vms.map((vm) => ({ name: String(vm.name) })),
      },
    };
  }

  const counts = vms.reduce<MigrationVirtualMachinesStatusesCounts>(
    (acc, vm) => {
      const status = getMigrationVMStatus(vm);
      if (status) {
        acc[status].count += 1;
        const vmObj: MigrationVirtualMachinesStatusCountObjectVM = {
          name: String(vm.name),
        };
        if (status === MigrationVirtualMachineStatus.Failed) {
          vmObj.failedTaskName = (vm.pipeline ?? []).find((pipe) => pipe?.error)?.name;
        }
        acc[status].vms.push(vmObj);
      }
      return acc;
    },
    deepCopy<MigrationVirtualMachinesStatusesCounts>(emptyMigrationVmStatusCount) ??
      emptyMigrationVmStatusCount,
  );

  return counts;
};

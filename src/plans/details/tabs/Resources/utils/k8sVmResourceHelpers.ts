import type { OpenshiftVM, V1VirtualMachine } from '@forklift-ui/types';

import {
  EMPTY_CPU,
  EMPTY_MEMORY,
  K8S_UNIT_MULTIPLIERS,
  type K8sUnit,
  MILLICORES_TO_CORES_DIVIDER,
} from './constants';
import type { PlanResourcesTableProps, VMResources } from './types';

export const getK8sCPU = (vm: V1VirtualMachine): number | string =>
  vm?.spec?.template?.spec?.domain?.cpu?.cores ?? EMPTY_CPU;

export const getK8sVMMemory = (vm: V1VirtualMachine): string =>
  (vm?.spec?.template?.spec?.domain?.resources?.requests as unknown as Record<string, string>)
    ?.memory ?? EMPTY_MEMORY;

export const k8sMemoryToBytes = (
  quantity: string,
  fallback: number | null = null,
): number | null => {
  const input = quantity.trim();
  if (!input) {
    return fallback;
  }

  const numericPart = parseFloat(input);
  if (Number.isNaN(numericPart)) {
    return fallback;
  }

  const numericPartLength = numericPart.toString().length;
  const unitPart = input.slice(numericPartLength).toUpperCase() as K8sUnit;

  if (unitPart && !(unitPart in K8S_UNIT_MULTIPLIERS)) {
    return fallback;
  }

  const multiplier = K8S_UNIT_MULTIPLIERS[unitPart] ?? 1;
  return numericPart * multiplier;
};

export const k8sCpuToCores = (cpuString?: number | string): number => {
  if (cpuString === undefined) {
    return 1;
  }

  if (typeof cpuString === 'number') {
    return cpuString;
  }

  if (cpuString.endsWith('m')) {
    const millicores = parseInt(cpuString.slice(0, -1), 10);
    return millicores / MILLICORES_TO_CORES_DIVIDER;
  }
  return parseFloat(cpuString);
};

export const getOpenshiftPlanResources = (
  planInventory: OpenshiftVM[],
): PlanResourcesTableProps => {
  const planInventoryRunning = planInventory?.filter((vm) => vm?.object?.spec?.running);

  const totalResources = planInventory.reduce(
    (accumulator, currentVM) => {
      return {
        cpuCount: accumulator.cpuCount + k8sCpuToCores(getK8sCPU(currentVM.object)),
        memoryMB:
          accumulator.memoryMB +
          (k8sMemoryToBytes(getK8sVMMemory(currentVM.object)) ?? 0) / K8S_UNIT_MULTIPLIERS.Mi,
      };
    },
    { cpuCount: 0, memoryMB: 0 },
  );

  const totalResourcesRunning = planInventoryRunning.reduce(
    (accumulator, currentVM) => {
      return {
        cpuCount: accumulator.cpuCount + k8sCpuToCores(getK8sCPU(currentVM.object)),
        memoryMB:
          accumulator.memoryMB +
          (k8sMemoryToBytes(getK8sVMMemory(currentVM.object)) ?? 0) / K8S_UNIT_MULTIPLIERS.Mi,
      };
    },
    { cpuCount: 0, memoryMB: 0 },
  );

  const missingCPUInfo = planInventory.some(({ object }) => getK8sCPU(object) === EMPTY_CPU);
  const missingMemoryInfo = planInventory.some(
    ({ object }) => getK8sVMMemory(object) === EMPTY_MEMORY,
  );

  return {
    planInventoryRunningSize: planInventoryRunning?.length,
    planInventorySize: planInventory?.length,
    totalResources: missingCPUInfo ? ({} as VMResources) : totalResources,
    totalResourcesRunning: missingMemoryInfo ? ({} as VMResources) : totalResourcesRunning,
  };
};

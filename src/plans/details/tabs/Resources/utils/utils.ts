import { PROVIDER_TYPES } from 'src/providers/utils/constants';

import type {
  OpenshiftVM,
  OpenstackVM,
  ProviderVirtualMachine,
  V1VirtualMachine,
} from '@forklift-ui/types';
import type { EnhancedOvaVM } from '@utils/crds/plans/type-enhancements';

import {
  ACTIVE,
  EMPTY_CPU,
  EMPTY_MEMORY,
  K8S_UNIT_MULTIPLIERS,
  type K8sUnit,
  MILLICORES_TO_CORES_DIVIDER,
  POWERED_ON,
  UP,
} from './constants';
import type {
  EnhancedOVirtVM,
  EnhancedVSphereVM,
  PlanResourcesTableProps,
  VMResources,
} from './types';

const getVSpherePlanResources = (planInventory: EnhancedVSphereVM[]): PlanResourcesTableProps => {
  const planInventoryRunning = planInventory?.filter((vm) => vm.powerState === POWERED_ON);

  const totalResources: VMResources = planInventory.reduce(
    (accumulator, currentVM) => {
      return {
        cpuCount: accumulator.cpuCount + currentVM.cpuCount,
        memoryMB: accumulator.memoryMB + currentVM.memoryMB,
      };
    },
    { cpuCount: 0, memoryMB: 0 },
  );

  const totalResourcesRunning: VMResources = planInventoryRunning.reduce(
    (accumulator, currentVM) => {
      return {
        cpuCount: accumulator.cpuCount + currentVM.cpuCount,
        memoryMB: accumulator.memoryMB + currentVM.memoryMB,
      };
    },
    { cpuCount: 0, memoryMB: 0 },
  );

  return {
    planInventoryRunningSize: planInventoryRunning?.length,
    planInventorySize: planInventory?.length,
    totalResources,
    totalResourcesRunning,
  };
};

const getOVirtPlanResources = (planInventory: EnhancedOVirtVM[]): PlanResourcesTableProps => {
  const planInventoryRunning = planInventory?.filter((vm) => vm.status === UP);

  const totalResources = planInventory?.reduce(
    (accumulator, currentVM) => {
      return {
        cpuCount: accumulator.cpuCount + currentVM.cpuCores,
        memoryMB: accumulator.memoryMB + currentVM.memory / K8S_UNIT_MULTIPLIERS.M,
      };
    },
    { cpuCount: 0, memoryMB: 0 },
  );

  const totalResourcesRunning = planInventoryRunning?.reduce(
    (accumulator, currentVM) => {
      return {
        cpuCount: accumulator.cpuCount + currentVM.cpuCores,
        memoryMB: accumulator.memoryMB + currentVM.memory / K8S_UNIT_MULTIPLIERS.M,
      };
    },
    { cpuCount: 0, memoryMB: 0 },
  );
  return {
    planInventoryRunningSize: planInventoryRunning?.length,
    planInventorySize: planInventory?.length,
    totalResources,
    totalResourcesRunning,
  };
};

const getOVAPlanResources = (planInventory: EnhancedOvaVM[]): PlanResourcesTableProps => {
  const planInventoryRunning = planInventory?.filter((vm) => vm.powerState === POWERED_ON);

  const totalResources = planInventory.reduce(
    (accumulator, currentVM) => {
      return {
        cpuCount: accumulator.cpuCount + currentVM.cpuCount,
        memoryMB: accumulator.memoryMB + currentVM.memoryMB,
      };
    },
    { cpuCount: 0, memoryMB: 0 },
  );

  const totalResourcesRunning = planInventoryRunning.reduce(
    (accumulator, currentVM) => {
      return {
        cpuCount: accumulator.cpuCount + currentVM.cpuCount,
        memoryMB: accumulator.memoryMB + currentVM.memoryMB,
      };
    },
    { cpuCount: 0, memoryMB: 0 },
  );
  return {
    planInventoryRunningSize: planInventoryRunning?.length,
    planInventorySize: planInventory?.length,
    totalResources,
    totalResourcesRunning,
  };
};

const getOpenstackPlanResources = (planInventory: OpenstackVM[]): PlanResourcesTableProps => {
  const planInventoryRunning = planInventory?.filter((vm) => vm?.status === ACTIVE);

  return {
    planInventoryRunningSize: planInventoryRunning?.length,
    planInventorySize: planInventory?.length,
    totalResources: {} as VMResources,
    totalResourcesRunning: {} as VMResources,
  };
};

const getK8sCPU = (vm: V1VirtualMachine) =>
  vm?.spec?.template?.spec?.domain?.cpu?.cores ?? EMPTY_CPU;
const getK8sVMMemory = (vm: V1VirtualMachine): string =>
  (vm?.spec?.template?.spec?.domain?.resources?.requests as Record<string, string>)?.memory ??
  EMPTY_MEMORY;

const k8sMemoryToBytes = (quantity: string, fallback: number | null = null): number | null => {
  const input = quantity.trim();
  if (!input) return fallback;

  const numericPart = parseFloat(input);
  if (Number.isNaN(numericPart)) return fallback;

  const numericPartLength = numericPart.toString().length;
  const unitPart = input.slice(numericPartLength).toUpperCase() as K8sUnit;

  if (unitPart && !(unitPart in K8S_UNIT_MULTIPLIERS)) {
    return fallback;
  }

  const multiplier = K8S_UNIT_MULTIPLIERS[unitPart] ?? 1;
  return numericPart * multiplier;
};

const k8sCpuToCores = (cpuString?: number | string): number => {
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

const getOpenshiftPlanResources = (planInventory: OpenshiftVM[]): PlanResourcesTableProps => {
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

  const missingCPUInfo = planInventory.find(({ object }) => getK8sCPU(object) === EMPTY_CPU);
  const missingMemoryInfo = planInventory.find(
    ({ object }) => getK8sVMMemory(object) === EMPTY_MEMORY,
  );

  return {
    planInventoryRunningSize: planInventoryRunning?.length,
    planInventorySize: planInventory?.length,
    totalResources: missingCPUInfo ? ({} as VMResources) : totalResources,
    totalResourcesRunning: missingMemoryInfo ? ({} as VMResources) : totalResourcesRunning,
  };
};

export const getPlanResourcesTableProps = (
  planInventory: ProviderVirtualMachine[],
  providerType: string | undefined,
): PlanResourcesTableProps | null => {
  switch (providerType) {
    case PROVIDER_TYPES.ovirt:
      return getOVirtPlanResources(planInventory as EnhancedOVirtVM[]);
    case PROVIDER_TYPES.openshift:
      return getOpenshiftPlanResources(planInventory as OpenshiftVM[]);
    case PROVIDER_TYPES.openstack:
      return getOpenstackPlanResources(planInventory as OpenstackVM[]);
    case PROVIDER_TYPES.vsphere:
      return getVSpherePlanResources(planInventory as EnhancedVSphereVM[]);
    case PROVIDER_TYPES.ova:
    case PROVIDER_TYPES.hyperv:
      return getOVAPlanResources(planInventory as EnhancedOvaVM[]);
    case undefined:
    default:
      return null;
  }
};

import type { OpenstackVM } from '@forklift-ui/types';
import type { EnhancedHypervVM, EnhancedOvaVM } from '@utils/crds/plans/type-enhancements';

import { ACTIVE, K8S_UNIT_MULTIPLIERS, POWERED_ON, UP } from './constants';
import type {
  EnhancedOVirtVM,
  EnhancedVSphereVM,
  PlanResourcesTableProps,
  VMResources,
} from './types';

export const getVSpherePlanResources = (
  planInventory: EnhancedVSphereVM[],
): PlanResourcesTableProps => {
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

export const getOVirtPlanResources = (
  planInventory: EnhancedOVirtVM[],
): PlanResourcesTableProps => {
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

const getPoweredOnPlanResources = (
  planInventory: { cpuCount: number; memoryMB: number; powerState: string }[],
): PlanResourcesTableProps => {
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

export const getOVAPlanResources = (planInventory: EnhancedOvaVM[]): PlanResourcesTableProps =>
  getPoweredOnPlanResources(planInventory);

export const getHypervPlanResources = (
  planInventory: EnhancedHypervVM[],
): PlanResourcesTableProps => getPoweredOnPlanResources(planInventory);

export const getOpenstackPlanResources = (
  planInventory: OpenstackVM[],
): PlanResourcesTableProps => {
  const planInventoryRunning = planInventory?.filter((vm) => vm?.status === ACTIVE);

  return {
    planInventoryRunningSize: planInventoryRunning?.length,
    planInventorySize: planInventory?.length,
    totalResources: {} as VMResources,
    totalResourcesRunning: {} as VMResources,
  };
};

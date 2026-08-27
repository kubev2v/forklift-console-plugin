import type { ProviderVirtualMachine } from '@forklift-ui/types';

import { NUTANIX_POWERED_ON } from './constants';
import type { NutanixVM, PlanResourcesTableProps } from './types';

export const getNutanixPlanResources = (
  planInventory: ProviderVirtualMachine[],
): PlanResourcesTableProps => {
  const nutanixInventory = planInventory as NutanixVM[];
  const planInventoryRunning = nutanixInventory.filter(
    (vm) => vm.powerState?.toUpperCase() === NUTANIX_POWERED_ON,
  );

  const totalResources = nutanixInventory.reduce(
    (accumulator, currentVM) => {
      return {
        cpuCount:
          accumulator.cpuCount + (currentVM.numSockets ?? 0) * (currentVM.numVcpusPerSocket ?? 0),
        memoryMB: accumulator.memoryMB + (currentVM.memorySizeMib ?? 0),
      };
    },
    { cpuCount: 0, memoryMB: 0 },
  );

  const totalResourcesRunning = planInventoryRunning.reduce(
    (accumulator, currentVM) => {
      return {
        cpuCount:
          accumulator.cpuCount + (currentVM.numSockets ?? 0) * (currentVM.numVcpusPerSocket ?? 0),
        memoryMB: accumulator.memoryMB + (currentVM.memorySizeMib ?? 0),
      };
    },
    { cpuCount: 0, memoryMB: 0 },
  );

  return {
    planInventoryRunningSize: planInventoryRunning.length,
    planInventorySize: nutanixInventory.length,
    totalResources,
    totalResourcesRunning,
  };
};

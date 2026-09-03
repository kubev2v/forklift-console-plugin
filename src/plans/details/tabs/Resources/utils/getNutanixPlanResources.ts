import type { NutanixVM, ProviderVirtualMachine } from '@forklift-ui/types';

import { NUTANIX_POWERED_ON } from './constants';
import type { PlanResourcesTableProps } from './types';

const getVmResources = (vm: NutanixVM): { cpuCount: number; memoryMB: number } => ({
  cpuCount: (vm.numSockets ?? 0) * (vm.numVcpusPerSocket ?? 0),
  memoryMB: vm.memorySizeMib ?? 0,
});

export const getNutanixPlanResources = (
  planInventory: ProviderVirtualMachine[],
): PlanResourcesTableProps => {
  // Inventory API omits providerType on Nutanix VMs — planInventory is already scoped to the plan.
  const nutanixInventory = planInventory as NutanixVM[];
  const planInventoryRunning = nutanixInventory.filter(
    (vm) => vm.powerState?.toUpperCase() === NUTANIX_POWERED_ON,
  );

  const totalResources = nutanixInventory.reduce(
    (accumulator, currentVM) => {
      const { cpuCount, memoryMB } = getVmResources(currentVM);
      return {
        cpuCount: accumulator.cpuCount + cpuCount,
        memoryMB: accumulator.memoryMB + memoryMB,
      };
    },
    { cpuCount: 0, memoryMB: 0 },
  );

  const totalResourcesRunning = planInventoryRunning.reduce(
    (accumulator, currentVM) => {
      const { cpuCount, memoryMB } = getVmResources(currentVM);
      return {
        cpuCount: accumulator.cpuCount + cpuCount,
        memoryMB: accumulator.memoryMB + memoryMB,
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

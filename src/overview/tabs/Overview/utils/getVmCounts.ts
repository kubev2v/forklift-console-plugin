import type { V1beta1Migration, V1beta1MigrationStatusVms } from '@kubev2v/types';

// Helper function to process 'True' vm conditions
const processVmConditions = (vm: V1beta1MigrationStatusVms) => {
  if (!('conditions' in vm)) return [];

  return (vm.conditions ?? []).reduce((acc: string[], condition) => {
    if (condition.status === 'True') acc.push(condition.type);
    return acc;
  }, []);
};

// Helper function to increment vmCounts based on conditions
const incrementCounts = (
  conditions: string[],
  vm: V1beta1MigrationStatusVms,
  vmCounts: Record<string, number>,
) => {
  vmCounts.Total += 1;

  const isRunning =
    vm?.phase !== 'Completed' && !conditions.includes('Failed') && !conditions.includes('Canceled');
  const isCompleted = vm?.phase === 'Completed';

  if (isRunning) {
    vmCounts.Running += 1;
  }

  if (isCompleted) {
    conditions.forEach((condition) => {
      if (condition in vmCounts) vmCounts[condition] += 1;
    });
  }
};

/**
 * This function gets the number of 'Running', 'Failed', and 'Succeeded' VMs in the migrations.
 * @param {V1beta1Migration[]} migrations - The array of migration objects to inspect.
 * @return {Object} A dictionary with the phase as the key and the count as the value.
 */
export const getVmCounts = (migrations: V1beta1Migration[]): Record<string, number> => {
  const vmCounts: Record<string, number> = {
    Canceled: 0,
    Failed: 0,
    Running: 0,
    Succeeded: 0,
    Total: 0,
  };

  for (const migration of migrations || []) {
    if (migration?.status?.vms) {
      for (const vm of migration.status.vms) {
        const conditions = processVmConditions(vm);
        incrementCounts(conditions, vm, vmCounts);
      }
    }
  }

  return vmCounts;
};

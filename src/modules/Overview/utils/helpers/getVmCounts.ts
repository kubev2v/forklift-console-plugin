import { V1beta1Migration } from '@kubev2v/types';

// Helper function to process 'True' vm conditions
function processVmConditions(vm) {
  if (!('conditions' in vm)) return [];

  return vm.conditions.reduce((acc: string[], condition) => {
    if (condition.status === 'True') acc.push(condition.type);
    return acc;
  }, []);
}

// Helper function to increment vmCounts based on conditions
function incrementCounts(conditions: string[], vm, vmCounts: { [key: string]: number }) {
  vmCounts['Total']++;

  const isRunning =
    vm?.phase !== 'Completed' && !conditions.includes('Failed') && !conditions.includes('Canceled');
  const isCompleted = vm?.phase === 'Completed';

  if (isRunning) {
    vmCounts['Running']++;
  }

  if (isCompleted) {
    conditions.forEach((condition) => {
      if (condition in vmCounts) vmCounts[condition]++;
    });
  }
}

/**
 * This function gets the number of 'Running', 'Failed', and 'Succeeded' VMs in the migrations.
 * @param {V1beta1Migration[]} migrations - The array of migration objects to inspect.
 * @return {Object} A dictionary with the phase as the key and the count as the value.
 */
export function getVmCounts(migrations: V1beta1Migration[]): { [key: string]: number } {
  const vmCounts: { [key: string]: number } = {
    Total: 0,
    Running: 0,
    Failed: 0,
    Canceled: 0,
    Succeeded: 0,
  };

  for (const migration of migrations || []) {
    if ('vms' in migration.status) {
      for (const vm of migration.status.vms) {
        const conditions = processVmConditions(vm);
        incrementCounts(conditions, vm, vmCounts);
      }
    }
  }

  return vmCounts;
}

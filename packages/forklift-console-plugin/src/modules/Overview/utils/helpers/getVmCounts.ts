import { V1beta1Migration } from '@kubev2v/types';

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
    Succeeded: 0,
  };

  for (const migration of migrations || []) {
    if ('vms' in migration.status) {
      for (const vm of migration.status.vms) {
        vmCounts['Total']++;
        if ('conditions' in vm) {
          for (const condition of vm.conditions) {
            if (condition.status == 'True') {
              if (condition.type in vmCounts) {
                vmCounts[condition.type]++;
              }
            }
          }
        }
      }
    }
  }

  return vmCounts;
}

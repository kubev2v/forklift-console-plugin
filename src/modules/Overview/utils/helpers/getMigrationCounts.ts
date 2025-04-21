import type { V1beta1Migration } from '@kubev2v/types';

/**
 * This function gets the number of 'Running', 'Failed', and 'Succeeded' migrations.
 * @param {V1beta1Migration[]} migrations - The array of migration objects to inspect.
 * @return {Object} A dictionary with the phase as the key and the count as the value.
 */
export const getMigrationCounts = (migrations: V1beta1Migration[]): Record<string, number> => {
  const migrationCounts: Record<string, number> = {
    Canceled: 0,
    Failed: 0,
    Running: 0,
    Succeeded: 0,
    Total: 0,
  };

  for (const migration of migrations || []) {
    migrationCounts.Total += 1;

    if (migration.status?.conditions) {
      for (const condition of migration.status.conditions) {
        if (condition.status === 'True' && condition.type in migrationCounts) {
          migrationCounts[condition.type] += 1;
        }
      }
    }
  }

  return migrationCounts;
};

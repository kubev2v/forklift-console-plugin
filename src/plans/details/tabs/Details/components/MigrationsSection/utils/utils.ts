import type { V1beta1Migration } from '@forklift-ui/types';

export const sortMigrationsByStartedAtDate = (migrations: V1beta1Migration[]) =>
  // Copy-then-sort: ES2022 target has no Array.prototype.toSorted (ES2023).
  [...migrations].sort((migrationA, migrationB) => {
    const dateA = new Date(migrationA?.status?.started ?? '');
    const dateB = new Date(migrationB?.status?.started ?? '');
    return dateB.getTime() - dateA.getTime();
  });

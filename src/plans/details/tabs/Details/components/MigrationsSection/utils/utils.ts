import type { V1beta1Migration } from '@forklift-ui/types';

export const sortMigrationsByStartedAtDate = (migrations: V1beta1Migration[]) =>
  migrations.toSorted((migrationA, migrationB) => {
    const dateA = new Date(migrationA?.status?.started ?? '');
    const dateB = new Date(migrationB?.status?.started ?? '');
    return dateB.getTime() - dateA.getTime();
  });

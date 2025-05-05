import type { V1beta1Migration } from '@kubev2v/types';

export const sortMigrationsByStartedAtDate = (migrations: V1beta1Migration[]) =>
  migrations.sort((migrationA, migrationB) => {
    const dateA = new Date(migrationA?.status?.started ?? '');
    const dateB = new Date(migrationB?.status?.started ?? '');
    return dateB.getTime() - dateA.getTime();
  });

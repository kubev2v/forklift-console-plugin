import type { V1beta1Migration } from '@forklift-ui/types';
import { getMigrationResourcePerformance } from '@utils/migrations/migrationPerformance';

export const getMigrationStatusFromVMs = (resourceData: unknown): string | null => {
  const migration = resourceData as V1beta1Migration | undefined;

  return migration ? getMigrationResourcePerformance(migration).status : null;
};

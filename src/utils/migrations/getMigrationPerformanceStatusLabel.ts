import type { TFunction } from 'i18next';

import {
  MIGRATION_PERFORMANCE_STATUS,
  type MigrationPerformanceStatus,
} from './migrationPerformanceConstants';

export const getMigrationPerformanceStatusLabel = (
  status: MigrationPerformanceStatus,
  fallback: string | null,
  t: TFunction,
): string | null => {
  if (status === MIGRATION_PERFORMANCE_STATUS.PARTIAL) {
    return t('Partially migrated');
  }

  if (status === MIGRATION_PERFORMANCE_STATUS.CANCELED) {
    return t('Canceled');
  }

  return fallback;
};

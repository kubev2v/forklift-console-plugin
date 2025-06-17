import { getMigrationVMsStatusCounts } from 'src/plans/details/components/PlanStatus/utils/utils';
import { getMigrationStatusLabel } from 'src/plans/details/tabs/Details/components/MigrationsSection/components/utils/utils';

import type { V1beta1Migration } from '@kubev2v/types';

export const getMigrationStatusFromVMs = (migration: V1beta1Migration): string | null => {
  const migrationVMs = migration?.status?.vms;
  const vmStatuses = getMigrationVMsStatusCounts(migrationVMs ?? [], migrationVMs?.length ?? 0);
  return getMigrationStatusLabel(vmStatuses, migrationVMs?.length);
};

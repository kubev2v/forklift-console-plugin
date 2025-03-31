import type { CreateVmMigrationPageState } from 'src/modules/Providers/views/migrate/types';

export const anyValidationErrorExists = (state: CreateVmMigrationPageState): boolean =>
  Object.values(state?.validation || []).some((validation) => validation === 'error');

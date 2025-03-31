import type { CreateVmMigrationPageState } from 'src/modules/Providers/views/migrate/types';

import type { PlanCreatePageState } from './states';

export const validateSourceProviderStep = (
  state: CreateVmMigrationPageState,
  filterState: PlanCreatePageState,
) =>
  state.underConstruction.plan.metadata.name &&
  state.validation.planName !== 'error' &&
  filterState?.selectedVMs?.length > 0;

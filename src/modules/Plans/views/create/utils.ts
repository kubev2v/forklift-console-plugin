import { CreateVmMigrationPageState } from 'src/modules/Providers/views/migrate/types';

import { PlanCreatePageState } from './states/PlanCreatePageStore';

export const validateSourceProviderStep = (
  state: CreateVmMigrationPageState,
  filterState: PlanCreatePageState,
) =>
  state.underConstruction.plan.metadata.name &&
  state.validation.planName !== 'error' &&
  filterState?.selectedVMs?.length > 0;

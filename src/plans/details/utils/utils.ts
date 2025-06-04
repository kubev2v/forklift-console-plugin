import type { V1beta1PlanStatusMigrationVms } from '@kubev2v/types';

import { planMigrationVirtualMachineStatuses } from '../components/PlanStatus/utils/types';

export const isMigrationVirtualMachinePaused = (vm: V1beta1PlanStatusMigrationVms | undefined) =>
  vm?.phase === planMigrationVirtualMachineStatuses.CopyingPaused;

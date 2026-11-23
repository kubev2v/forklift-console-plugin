import { isMigrationVirtualMachinePaused } from 'src/plans/details/utils/utils';

import type { V1beta1MigrationStatusVms } from '@forklift-ui/types';

export const getCutoverWaitingVmsCounter = (migrationVms: V1beta1MigrationStatusVms[]): number => {
  return migrationVms.filter((vm) => isMigrationVirtualMachinePaused(vm)).length;
};

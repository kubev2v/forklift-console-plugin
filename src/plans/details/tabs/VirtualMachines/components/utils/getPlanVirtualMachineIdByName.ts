import type { V1beta1Plan } from '@kubev2v/types';
import { getPlanVirtualMachinesMigrationStatus } from '@utils/crds/plans/selectors';

export const getPlanVirtualMachineIdByName = (plan: V1beta1Plan, vmName: string | undefined) => {
  const migrationVirtualMachines = getPlanVirtualMachinesMigrationStatus(plan);

  return migrationVirtualMachines.find((migrationVm) => migrationVm?.name === vmName)?.id;
};

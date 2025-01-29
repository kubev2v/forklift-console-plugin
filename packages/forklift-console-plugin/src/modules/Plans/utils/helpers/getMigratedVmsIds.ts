import { V1beta1Plan } from '@kubev2v/types';

import { getVMMigrationStatus } from '../../views/details/tabs/VirtualMachines/Migration/MigrationVirtualMachinesList';

export const getMigratedVmsIds = (plan: V1beta1Plan) => {
  const migrationVms = plan?.status?.migration?.vms;
  const migratedVmsIds = migrationVms?.reduce((migrated, vm) => {
    if (getVMMigrationStatus(vm) === 'Succeeded') {
      migrated.push(vm.id);
    }
    return migrated;
  }, []);
  return migratedVmsIds;
};

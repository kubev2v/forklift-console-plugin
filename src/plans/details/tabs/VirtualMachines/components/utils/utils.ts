import type { V1beta1Plan, V1beta1PlanStatusMigrationVms } from '@forklift-ui/types';
import { getPlanVirtualMachinesMigrationStatus } from '@utils/crds/plans/selectors';

export const getPlanVirtualMachinesDict = (plan: V1beta1Plan) => {
  const migrationVirtualMachines = getPlanVirtualMachinesMigrationStatus(plan);

  const vmDict = migrationVirtualMachines.reduce<Record<string, V1beta1PlanStatusMigrationVms>>(
    (dict, migration) => {
      dict[migration.id!] = migration;
      return dict;
    },
    {},
  );

  return vmDict;
};

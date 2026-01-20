import { MigrationTypeValue } from 'src/plans/create/steps/migration-type/constants';
import { ConcernCategory } from 'src/providers/details/tabs/VirtualMachines/constants';

import type { VirtualMachineWithConcerns } from '@components/Concerns/utils/constants';
import type { Concern, V1beta1Plan, V1beta1PlanStatusMigrationVms } from '@kubev2v/types';

import { planMigrationVirtualMachineStatuses } from '../components/PlanStatus/utils/types';
import type { SpecVirtualMachinePageData } from '../tabs/VirtualMachines/components/PlanSpecVirtualMachinesList/utils/types';

export const isMigrationVirtualMachinePaused = (vm: V1beta1PlanStatusMigrationVms | undefined) =>
  vm?.phase === planMigrationVirtualMachineStatuses.CopyingPaused;

export const getPlanMigrationType = (plan: V1beta1Plan): MigrationTypeValue => {
  // check the new type field first then fall back to the warm bool
  switch (plan?.spec?.type) {
    case 'warm':
      return MigrationTypeValue.Warm;
    case 'live':
      return MigrationTypeValue.Live;
    case undefined:
    case 'cold':
    default:
      if (plan?.spec?.warm) {
        return MigrationTypeValue.Warm;
      }
      return MigrationTypeValue.Cold;
  }
};

export const getCriticalConcernsVmsMap = (vms: SpecVirtualMachinePageData[]) => {
  const map = new Map<string, number>();

  for (const vmData of vms ?? []) {
    const vmConcerns: Concern[] = (vmData?.inventoryVmData?.vm as VirtualMachineWithConcerns)
      ?.concerns;
    for (const concern of vmConcerns ?? []) {
      if (concern?.category === ConcernCategory?.Critical) {
        map.set(concern?.label, (map?.get(concern?.label) ?? 0) + 1);
      }
    }
  }
  return map;
};

import { getVmTargetPowerState } from 'src/plans/details/components/PlanStatus/utils/planStatusResolver';

import type { V1beta1Plan } from '@forklift-ui/types';
import { getPlanVirtualMachines, getVmExcludeDisks } from '@utils/crds/plans/selectors';
import type { EnhancedPlanSpecVms } from '@utils/plans/types';

import type { EditVmWizardFormValues } from '../types';

export const getDefaultEditVmWizardFormValues = (
  plan: V1beta1Plan,
  vmIndex: number,
): EditVmWizardFormValues => {
  const vm = getPlanVirtualMachines(plan)[vmIndex] as EnhancedPlanSpecVms | undefined;

  return {
    excludeDisks: getVmExcludeDisks(vm) ?? [],
    instanceType: vm?.instanceType,
    migrateSharedDisks: vm?.migrateSharedDisks,
    networkNameTemplate: vm?.networkNameTemplate,
    pvcNameTemplate: vm?.pvcNameTemplate,
    targetName: vm?.targetName ?? '',
    targetPowerState: getVmTargetPowerState(vm ?? {}),
    volumeNameTemplate: vm?.volumeNameTemplate,
  };
};

import { getPipelineStepDisplayName } from 'src/plans/details/tabs/VirtualMachines/components/MigrationStatusVirtualMachineList/utils/utils';

import type { V1beta1MigrationStatusVms } from '@forklift-ui/types';

import { getVmPipelineStep } from './getVmPipelineStep';

const extractAllPipelinesSteps = (vms: V1beta1MigrationStatusVms[]): Set<string> => {
  const allSteps = new Set<string>();

  for (const vm of vms) {
    for (const pipelineStep of vm.pipeline) {
      allSteps.add(getPipelineStepDisplayName(pipelineStep.name));
    }
  }
  return allSteps;
};

export const getPipelineStepCount = (vms: V1beta1MigrationStatusVms[]): Map<string, number> => {
  const allSteps = extractAllPipelinesSteps(vms);
  const counterMap = new Map<string, number>();

  for (const step of allSteps) {
    counterMap.set(step, 0);
  }

  for (const vm of vms) {
    const stepName = getVmPipelineStep(vm);
    if (stepName) {
      counterMap.set(stepName, (counterMap.get(stepName) ?? 0) + 1);
    }
  }

  return counterMap;
};

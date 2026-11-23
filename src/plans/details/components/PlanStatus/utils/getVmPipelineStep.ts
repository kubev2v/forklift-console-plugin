import {
  CUTOVER_NAME,
  getPipelineStepDisplayName,
} from 'src/plans/details/tabs/VirtualMachines/components/MigrationStatusVirtualMachineList/utils/utils';
import { isMigrationVirtualMachinePaused } from 'src/plans/details/utils/utils';

import type { V1beta1PlanStatusMigrationVms } from '@forklift-ui/types';
import { taskStatuses } from '@utils/constants';
import { isEmpty } from '@utils/helpers';

export const getVmPipelineStep = (
  statusVM: V1beta1PlanStatusMigrationVms | undefined,
): string | undefined => {
  const pipeline = statusVM?.pipeline;
  if (isEmpty(pipeline)) {
    return undefined;
  }

  const failedStep = pipeline?.find((step) => step.error !== undefined);
  if (failedStep) {
    return getPipelineStepDisplayName(failedStep.name);
  }

  if (isMigrationVirtualMachinePaused(statusVM)) {
    return getPipelineStepDisplayName(CUTOVER_NAME);
  }

  const activeStep = pipeline?.find((step) => step.phase !== taskStatuses.completed);
  if (activeStep !== undefined) {
    return getPipelineStepDisplayName(activeStep.name);
  }

  return undefined;
};

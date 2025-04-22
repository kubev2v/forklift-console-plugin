import { useMemo } from 'react';

import type { V1beta1Plan } from '@kubev2v/types';
import { taskStatuses } from '@utils/constants';

import { usePlanMigration } from '../../../../../../modules/Plans/hooks/usePlanMigration';
import type { VirtualMachinePipelineTask } from '../utils/types';

const usePipelineTaskProgress = (plan: V1beta1Plan) => {
  const [lastMigration] = usePlanMigration(plan);

  const vmPipelineTasks = useMemo(
    () =>
      lastMigration?.status?.vms?.reduce((acc: VirtualMachinePipelineTask[], migrationVm) => {
        migrationVm.pipeline.forEach((pipelineStep) => {
          acc.push({
            status: pipelineStep.phase!,
            task: pipelineStep.name,
            vmName: migrationVm.name!,
          });
        });

        return acc;
      }, []),
    [lastMigration?.status?.vms],
  );

  const completedVmPipelineTasks = vmPipelineTasks?.filter(
    (pipelineTask) => pipelineTask.status === taskStatuses.completed,
  );

  const progressValue = vmPipelineTasks?.length
    ? (100 * (completedVmPipelineTasks?.length ?? 0)) / vmPipelineTasks.length
    : 0;

  return progressValue;
};

export default usePipelineTaskProgress;

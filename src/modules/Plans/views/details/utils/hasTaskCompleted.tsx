import type {
  V1beta1PlanStatusMigrationVmsPipeline,
  V1beta1PlanStatusMigrationVmsPipelineTasksProgress,
} from '@kubev2v/types';

import { hasPipelineCompleted, hasPipelineNotFailed } from '.';

/**
 *  Check if a given task within a pipeline has completed.
 *
 *  A task if marked as completed successfully if:
 *  1. its phase is marked as completed
 *  or
 *  2. its phase is not set but its contained pipeline step has completed successfully
 *  or
 *  3. its phase is not set and its contained pipeline step is not completed and not failed,
 *  but its progress completed units equal its progress total units.
 *
 * @param {string } taskPhase A given task's phase
 * @param {V1beta1PlanStatusMigrationVmsPipeline} pipeline - A given migration's pipeline step which includes the task
 * @returns {boolean} - Returns true if the task has completed.
 */
export const hasTaskCompleted = (
  taskPhase: string,
  taskProgress: V1beta1PlanStatusMigrationVmsPipelineTasksProgress,
  pipeline: V1beta1PlanStatusMigrationVmsPipeline,
) =>
  taskPhase === 'Completed' ||
  (taskPhase === undefined && hasPipelineCompleted(pipeline)) ||
  (taskPhase === undefined && hasPipelineOkAndTaskProgressCompleted(taskProgress, pipeline));

const hasPipelineOkAndTaskProgressCompleted = (
  taskProgress: V1beta1PlanStatusMigrationVmsPipelineTasksProgress,
  pipeline: V1beta1PlanStatusMigrationVmsPipeline,
) => hasPipelineNotFailed(pipeline) && taskProgress.completed === taskProgress.total;

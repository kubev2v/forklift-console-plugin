import { V1beta1PlanStatusMigrationVmsPipeline } from '@kubev2v/types';

import { hasPipelineCompleted } from './hasPipelineCompleted';

/**
 *  Check if a given task within a pipeline has completed.
 *
 *  A task if marked as completed successfully if its phase is marked as completed or if
 *  its phase is not set but its contained pipeline step has completed successfully.
 *
 * @param {string } taskPhase A given task's phase
 * @param {V1beta1PlanStatusMigrationVmsPipeline} pipeline - A given migration's pipeline step which includes the task
 * @returns {boolean} - Returns true if the task has completed.
 */
export const hasTaskCompleted = (
  taskPhase: string,
  pipeline: V1beta1PlanStatusMigrationVmsPipeline,
) => taskPhase === 'Completed' || (taskPhase === undefined && hasPipelineCompleted(pipeline));

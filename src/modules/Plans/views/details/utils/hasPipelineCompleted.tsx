import type { V1beta1PlanStatusMigrationVmsPipeline } from '@kubev2v/types';

import { hasPipelineNotFailed } from './hasPipelineNotFailed';

/**
 * Check if a given migration's pipeline step has completed successfully.
 *
 * @param {V1beta1PlanStatusMigrationVmsPipeline} pipeline - A given migration's pipeline step
 * @returns {boolean} - True if the migration step has completed successfully, false otherwise.
 */
export const hasPipelineCompleted = (pipeline: V1beta1PlanStatusMigrationVmsPipeline) =>
  hasPipelineNotFailed(pipeline) && pipeline?.phase === 'Completed';

import type { V1beta1PlanStatusMigrationVmsPipeline } from '@kubev2v/types';

/**
 * Check if a given migration's pipeline step has not failed.
 *
 * @param {V1beta1PlanStatusMigrationVmsPipeline} pipeline - A given migration's pipeline step
 * @returns {boolean} - True if the migration step has not failed, false otherwise.
 */
export const hasPipelineNotFailed = (pipeline: V1beta1PlanStatusMigrationVmsPipeline) =>
  !pipeline?.error;

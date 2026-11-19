import type {
  V1beta1PlanStatusMigrationVms,
  V1beta1PlanStatusMigrationVmsPipeline,
} from '@forklift-ui/types';

export const pipelineStep = (
  name: string,
  phase?: string,
): V1beta1PlanStatusMigrationVmsPipeline => ({
  name,
  phase,
  progress: { completed: 1, total: 1 },
});

export const coldPipeSteps = [
  'Initialize',
  'DiskAllocation',
  'ImageConversion',
  'DiskTransfer',
  'VirtualMachineCreation',
];
export const warmPipeSteps = [
  'Initialize',
  'DiskAllocation',
  'ImageConversion',
  'PreflightInspection',
  'Cutover',
  'DiskTransfer',
  'VirtualMachineCreation',
];

export const mergedColdWarmStepNames = [
  'Initialize',
  'Disk allocation',
  'Image conversion',
  'Disk transfer',
  'Virtual machine creation',
  'Preflight inspection',
  'Cutover',
];

export const vmConstructor = (
  pipeline: V1beta1PlanStatusMigrationVmsPipeline[],
  phase?: string,
  overrides: Partial<V1beta1PlanStatusMigrationVms> = {},
): V1beta1PlanStatusMigrationVms =>
  ({
    pipeline,
    phase,
    ...overrides,
  }) as V1beta1PlanStatusMigrationVms;

export const createStillColdVm = (): V1beta1PlanStatusMigrationVms => {
  return vmConstructor(coldPipeSteps.map((stepName) => pipelineStep(stepName)));
};

export const createStillWarmVm = (): V1beta1PlanStatusMigrationVms => {
  return vmConstructor(warmPipeSteps.map((stepName) => pipelineStep(stepName)));
};

import type {
  V1beta1PlanStatusMigrationVms,
  V1beta1PlanStatusMigrationVmsConditions,
  V1beta1PlanStatusMigrationVmsPipeline,
} from '@forklift-ui/types';
import { describe, expect, it } from '@jest/globals';
import { CATEGORY_TYPES, CONDITION_STATUS, taskStatuses } from '@utils/constants';

import { getMigrationVMStatus } from '../migrationVmStatus';
import { MigrationVirtualMachineStatus } from '../types';

const condition = (
  type: string,
  status: string = CONDITION_STATUS.TRUE,
): V1beta1PlanStatusMigrationVmsConditions => ({
  category: 'Advisory',
  lastTransitionTime: '2024-01-01T00:00:00Z',
  status,
  type,
});

const pipelineStep = (name: string, phase: string): V1beta1PlanStatusMigrationVmsPipeline => ({
  name,
  phase,
  progress: { completed: 1, total: 1 },
});

const vm = (
  overrides: Partial<V1beta1PlanStatusMigrationVms> = {},
): V1beta1PlanStatusMigrationVms =>
  ({
    pipeline: [
      pipelineStep('Initialize', taskStatuses.completed),
      pipelineStep('DiskAllocation', taskStatuses.completed),
      pipelineStep('ImageConversion', taskStatuses.completed),
      pipelineStep('DiskTransferV2v', taskStatuses.completed),
      pipelineStep('VirtualMachineCreation', taskStatuses.completed),
    ],
    ...overrides,
  }) as V1beta1PlanStatusMigrationVms;

describe('getMigrationVMStatus - pipeline cross-check', () => {
  it('returns Succeeded when condition is True and all pipeline steps completed', () => {
    expect(getMigrationVMStatus(vm({ conditions: [condition(CATEGORY_TYPES.SUCCEEDED)] }))).toBe(
      MigrationVirtualMachineStatus.Succeeded,
    );
  });

  it('returns InProgress when Succeeded condition is True but pipeline steps are Pending', () => {
    expect(
      getMigrationVMStatus(
        vm({
          conditions: [condition(CATEGORY_TYPES.SUCCEEDED)],
          pipeline: [
            pipelineStep('Initialize', taskStatuses.completed),
            pipelineStep('DiskAllocation', taskStatuses.completed),
            pipelineStep('ImageConversion', taskStatuses.completed),
            pipelineStep('DiskTransferV2v', taskStatuses.pending),
            pipelineStep('VirtualMachineCreation', taskStatuses.pending),
          ],
          started: '2024-01-01T00:00:00Z',
        }),
      ),
    ).toBe(MigrationVirtualMachineStatus.InProgress);
  });

  it('returns InProgress when Succeeded condition is True but a step is still Running', () => {
    expect(
      getMigrationVMStatus(
        vm({
          conditions: [condition(CATEGORY_TYPES.SUCCEEDED)],
          pipeline: [
            pipelineStep('Initialize', taskStatuses.completed),
            pipelineStep('DiskTransfer', taskStatuses.running),
            pipelineStep('VirtualMachineCreation', taskStatuses.pending),
          ],
          started: '2024-01-01T00:00:00Z',
        }),
      ),
    ).toBe(MigrationVirtualMachineStatus.InProgress);
  });
});

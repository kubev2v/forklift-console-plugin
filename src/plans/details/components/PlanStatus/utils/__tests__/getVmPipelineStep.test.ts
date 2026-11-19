import {
  CUTOVER_NAME,
  getPipelineStepDisplayName,
} from 'src/plans/details/tabs/VirtualMachines/components/MigrationStatusVirtualMachineList/utils/utils';

import { describe, expect, it } from '@jest/globals';
import { taskStatuses } from '@utils/constants';

import { getVmPipelineStep } from '../getVmPipelineStep';
import { planMigrationVirtualMachineStatuses } from '../types';

import { coldPipeSteps, pipelineStep, vmConstructor, warmPipeSteps } from './test-utils';

describe('getVmPipelineStep', () => {
  it('returns the first failed step if there is one', () => {
    const failedVm = vmConstructor([
      pipelineStep(coldPipeSteps[0], taskStatuses.completed),
      pipelineStep(coldPipeSteps[1], taskStatuses.error),
      pipelineStep(coldPipeSteps[2], taskStatuses.pending),
      pipelineStep(coldPipeSteps[3], taskStatuses.pending),
      pipelineStep(coldPipeSteps[4], taskStatuses.pending),
    ]);
    expect(getVmPipelineStep(failedVm)).toBe(getPipelineStepDisplayName(coldPipeSteps[1]));
  });

  it('returns the current active step if there is one', () => {
    const runningVm = vmConstructor([
      pipelineStep(coldPipeSteps[0], taskStatuses.completed),
      pipelineStep(coldPipeSteps[1], taskStatuses.completed),
      pipelineStep(coldPipeSteps[2], taskStatuses.running),
      pipelineStep(coldPipeSteps[3], taskStatuses.pending),
      pipelineStep(coldPipeSteps[4], taskStatuses.pending),
    ]);
    expect(getVmPipelineStep(runningVm)).toBe(getPipelineStepDisplayName(coldPipeSteps[2]));
  });

  it('returns cutover if the vm is currently waiting on cutover', () => {
    const cutoverVm = vmConstructor(
      [
        pipelineStep(warmPipeSteps[0], taskStatuses.completed),
        pipelineStep(warmPipeSteps[1], taskStatuses.completed),
        pipelineStep(warmPipeSteps[2], taskStatuses.completed),
        pipelineStep(warmPipeSteps[3], taskStatuses.completed),
        pipelineStep(warmPipeSteps[4], taskStatuses.pending),
        pipelineStep(warmPipeSteps[5], taskStatuses.pending),
        pipelineStep(warmPipeSteps[6], taskStatuses.pending),
      ],
      planMigrationVirtualMachineStatuses.CopyingPaused,
    );
    expect(getVmPipelineStep(cutoverVm)).toBe(getPipelineStepDisplayName(CUTOVER_NAME));
  });

  it('returns the next step to come if the vm is currently transitioning between steps', () => {
    const transitioningVm = vmConstructor([
      pipelineStep(coldPipeSteps[0], taskStatuses.completed),
      pipelineStep(coldPipeSteps[1], taskStatuses.completed),
      pipelineStep(coldPipeSteps[2], taskStatuses.completed),
      pipelineStep(coldPipeSteps[3], taskStatuses.pending),
      pipelineStep(coldPipeSteps[4], taskStatuses.pending),
    ]);
    expect(getVmPipelineStep(transitioningVm)).toBe(getPipelineStepDisplayName(coldPipeSteps[3]));
  });
});

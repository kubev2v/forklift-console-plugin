import { getPipelineStepCount } from '../pipelineStepCounter';

import { createStillColdVm, createStillWarmVm, mergedColdWarmStepNames } from './test-utils';

const coldVm = createStillColdVm();
const warmVm = createStillWarmVm();
const vms = [coldVm, warmVm];
const counterMap = getPipelineStepCount(vms);

describe('getPipelineStepCounter', () => {
  it('displays all steps that will occur in the migration', () => {
    expect(new Set(counterMap.keys())).toEqual(new Set(mergedColdWarmStepNames));
  });

  it('does not duplicate a step', () => {
    expect([...counterMap.keys()]).toEqual([...new Set(counterMap.keys())]);
  });

  it('maps every vm to exactly one active step', () => {
    const vmsCounter = vms.length;
    let stepsCounter = 0;

    for (const value of counterMap.values()) {
      stepsCounter += value;
    }
    expect(vmsCounter).toEqual(stepsCounter);
  });
});

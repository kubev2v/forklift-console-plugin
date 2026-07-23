import type {
  V1beta1PlanStatusMigrationVms,
  V1beta1PlanStatusMigrationVmsPipeline,
} from '@forklift-ui/types';
import { describe, expect, it } from '@jest/globals';

import { getVMDiskTransferPipeline } from '../utils';

const makePipe = (
  overrides: Partial<V1beta1PlanStatusMigrationVmsPipeline> & { name: string },
): V1beta1PlanStatusMigrationVmsPipeline => ({
  progress: { completed: 0, total: 0 },
  ...overrides,
});

const makeStatusVM = (
  pipeline: V1beta1PlanStatusMigrationVmsPipeline[],
): V1beta1PlanStatusMigrationVms => ({ pipeline }) as unknown as V1beta1PlanStatusMigrationVms;

describe('getVMDiskTransferPipeline', () => {
  it('returns undefined when pipeline is empty', () => {
    expect(getVMDiskTransferPipeline(makeStatusVM([]))).toBeUndefined();
  });

  it('returns undefined when statusVM is undefined', () => {
    expect(getVMDiskTransferPipeline(undefined)).toBeUndefined();
  });

  it('returns the only disk step when there is exactly one', () => {
    const diskTransfer = makePipe({
      name: 'DiskTransferV2v',
      phase: 'Pending',
      progress: { completed: 0, total: 10240 },
    });
    const result = getVMDiskTransferPipeline(
      makeStatusVM([makePipe({ name: 'Initialize', phase: 'Completed' }), diskTransfer]),
    );

    expect(result).toBe(diskTransfer);
  });

  it('prefers the currently active/running disk step', () => {
    const diskAllocation = makePipe({
      name: 'DiskAllocation',
      phase: 'Running',
      progress: { completed: 5120, total: 10240 },
    });
    const diskTransfer = makePipe({
      name: 'DiskTransferV2v',
      phase: 'Pending',
      progress: { completed: 0, total: 10240 },
    });
    const result = getVMDiskTransferPipeline(makeStatusVM([diskAllocation, diskTransfer]));

    expect(result).toBe(diskAllocation);
  });

  it('falls back to DiskAllocation progress on healthy pipeline (copy-offload regression guard)', () => {
    const diskAllocation = makePipe({
      name: 'DiskAllocation',
      phase: 'Completed',
      progress: { completed: 10240, total: 10240 },
    });
    const diskTransfer = makePipe({
      name: 'DiskTransferV2v',
      phase: 'Pending',
      progress: { completed: 0, total: 10240 },
    });
    const result = getVMDiskTransferPipeline(
      makeStatusVM([
        makePipe({ name: 'Initialize', phase: 'Completed' }),
        diskAllocation,
        makePipe({ name: 'ImageConversion', phase: 'Completed' }),
        diskTransfer,
      ]),
    );

    expect(result).toBe(diskAllocation);
  });

  it('returns DiskTransfer when pipeline has a blocking failure (mismatch fix)', () => {
    const diskAllocation = makePipe({
      name: 'DiskAllocation',
      phase: 'Completed',
      progress: { completed: 10240, total: 10240 },
    });
    const diskTransfer = makePipe({
      name: 'DiskTransferV2v',
      phase: 'Pending',
      progress: { completed: 0, total: 10240 },
    });
    const result = getVMDiskTransferPipeline(
      makeStatusVM([
        makePipe({ name: 'Initialize', phase: 'Completed' }),
        diskAllocation,
        makePipe({
          error: { phase: 'ImageConversion', reasons: ['Guest conversion failed'] },
          name: 'ImageConversion',
          phase: 'Completed',
        }),
        diskTransfer,
      ]),
    );

    expect(result).toBe(diskTransfer);
  });

  it('prefers DiskTransfer with progress over DiskAllocation on healthy pipeline', () => {
    const diskAllocation = makePipe({
      name: 'DiskAllocation',
      phase: 'Completed',
      progress: { completed: 10240, total: 10240 },
    });
    const diskTransfer = makePipe({
      name: 'DiskTransferV2v',
      phase: 'Completed',
      progress: { completed: 10240, total: 10240 },
    });
    const result = getVMDiskTransferPipeline(
      makeStatusVM([
        makePipe({ name: 'Initialize', phase: 'Completed' }),
        diskAllocation,
        diskTransfer,
      ]),
    );

    expect(result).toBe(diskTransfer);
  });

  it('returns DiskTransfer by default when neither step has progress and pipeline is healthy', () => {
    const diskAllocation = makePipe({
      name: 'DiskAllocation',
      phase: 'Pending',
      progress: { completed: 0, total: 10240 },
    });
    const diskTransfer = makePipe({
      name: 'DiskTransferV2v',
      phase: 'Pending',
      progress: { completed: 0, total: 10240 },
    });
    const result = getVMDiskTransferPipeline(makeStatusVM([diskAllocation, diskTransfer]));

    expect(result).toBe(diskTransfer);
  });
});

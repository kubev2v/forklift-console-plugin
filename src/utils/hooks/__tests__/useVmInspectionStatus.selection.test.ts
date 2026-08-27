import { renderHook } from '@testing-library/react';
import { CONVERSION_PHASE, INSPECTION_STATUS } from '@utils/crds/conversion/constants';

import { useVmInspectionStatus } from '../useVmInspectionStatus';

import { conversion } from './useVmInspectionStatus.fixtures';

describe('useVmInspectionStatus - selection', () => {
  it('returns undefined when no conversion exists for the vm', () => {
    const { result } = renderHook(() => useVmInspectionStatus([]));
    expect(result.current('vm-missing')).toBeUndefined();
  });

  it('ignores conversions without vmID label', () => {
    const unlabeled = conversion();
    delete unlabeled.metadata.labels;
    const { result } = renderHook(() => useVmInspectionStatus([unlabeled]));
    expect(result.current('vm-1')).toBeUndefined();
  });

  it('prefers an active conversion over a newer completed one', () => {
    const completed = conversion({
      allChecksPassed: true,
      createdAt: '2024-02-01T00:00:00Z',
      phase: CONVERSION_PHASE.SUCCEEDED,
    });
    const running = conversion({
      createdAt: '2024-01-01T00:00:00Z',
      phase: CONVERSION_PHASE.RUNNING,
    });

    const { result } = renderHook(() => useVmInspectionStatus([completed, running]));
    const status = result.current('vm-1');

    expect(status?.status).toBe(INSPECTION_STATUS.RUNNING);
    expect(status?.conversion).toBe(running);
  });

  it('prefers the newer conversion when both are active', () => {
    const olderRunning = conversion({
      createdAt: '2024-01-01T00:00:00Z',
      phase: CONVERSION_PHASE.RUNNING,
    });
    const newerPending = conversion({
      createdAt: '2024-02-01T00:00:00Z',
      phase: CONVERSION_PHASE.PENDING,
    });

    const { result } = renderHook(() => useVmInspectionStatus([olderRunning, newerPending]));
    expect(result.current('vm-1')?.conversion).toBe(newerPending);
    expect(result.current('vm-1')?.status).toBe(INSPECTION_STATUS.PENDING);
  });

  it('prefers the newer conversion when both are inactive', () => {
    const older = conversion({
      createdAt: '2024-01-01T00:00:00Z',
      phase: CONVERSION_PHASE.FAILED,
    });
    const newer = conversion({
      allChecksPassed: true,
      createdAt: '2024-03-01T00:00:00Z',
      phase: CONVERSION_PHASE.SUCCEEDED,
    });

    const { result } = renderHook(() => useVmInspectionStatus([older, newer]));
    expect(result.current('vm-1')?.conversion).toBe(newer);
    expect(result.current('vm-1')?.status).toBe(INSPECTION_STATUS.INSPECTION_PASSED);
  });

  it('maps succeeded with failed checks to Issues found and reads snake_case flag', () => {
    const withCamel = conversion({
      allChecksPassed: false,
      phase: CONVERSION_PHASE.SUCCEEDED,
    });
    const withSnake = conversion({
      phase: CONVERSION_PHASE.SUCCEEDED,
      snakeAllChecksPassed: false,
      vmId: 'vm-2',
    });

    const { result } = renderHook(() => useVmInspectionStatus([withCamel, withSnake]));
    expect(result.current('vm-1')?.status).toBe(INSPECTION_STATUS.ISSUES_FOUND);
    expect(result.current('vm-1')?.inspectionPassed).toBe(false);
    expect(result.current('vm-2')?.status).toBe(INSPECTION_STATUS.ISSUES_FOUND);
  });

  it('maps failed, canceled, pending, and succeeded without inspection result', () => {
    const failed = conversion({ phase: CONVERSION_PHASE.FAILED, vmId: 'vm-f' });
    const canceled = conversion({ phase: CONVERSION_PHASE.CANCELED, vmId: 'vm-c' });
    const pending = conversion({ phase: CONVERSION_PHASE.PENDING, vmId: 'vm-p' });
    const succeededNoResult = conversion({ phase: CONVERSION_PHASE.SUCCEEDED, vmId: 'vm-s' });

    const { result } = renderHook(() =>
      useVmInspectionStatus([failed, canceled, pending, succeededNoResult]),
    );

    expect(result.current('vm-f')?.status).toBe(INSPECTION_STATUS.FAILED);
    expect(result.current('vm-c')?.status).toBe(INSPECTION_STATUS.CANCELED);
    expect(result.current('vm-p')?.status).toBe(INSPECTION_STATUS.PENDING);
    expect(result.current('vm-s')?.status).toBe(INSPECTION_STATUS.INSPECTION_PASSED);
  });

  it('exposes conversion name and lastRun from metadata', () => {
    const item = conversion({
      allChecksPassed: true,
      createdAt: '2024-05-05T12:00:00Z',
    });
    item.metadata.name = 'inspect-vm-1';

    const { result } = renderHook(() => useVmInspectionStatus([item]));
    const status = result.current('vm-1');

    expect(status?.conversionName).toBe('inspect-vm-1');
    expect(status?.lastRun).toBe('2024-05-05T12:00:00Z');
  });
});

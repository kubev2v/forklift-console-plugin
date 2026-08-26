import { renderHook } from '@testing-library/react-hooks';

import {
  CONVERSION_LABELS,
  CONVERSION_PHASE,
  INSPECTION_STATUS,
} from '@utils/crds/conversion/constants';
import type { V1beta1Conversion } from '@utils/crds/conversion/types';

import { useVmInspectionStatus } from '../useVmInspectionStatus';

const conversion = (
  overrides: Partial<V1beta1Conversion> & {
    vmId?: string;
    phase?: string;
    createdAt?: string;
    allChecksPassed?: boolean;
    all_checks_passed?: boolean;
  } = {},
): V1beta1Conversion => {
  const {
    vmId = 'vm-1',
    phase = CONVERSION_PHASE.SUCCEEDED,
    createdAt = '2024-01-01T00:00:00Z',
    allChecksPassed,
    all_checks_passed,
    ...rest
  } = overrides;

  return {
    apiVersion: 'forklift.konveyor.io/v1beta1',
    kind: 'Conversion',
    metadata: {
      name: `conversion-${vmId}-${createdAt}`,
      creationTimestamp: createdAt,
      labels: { [CONVERSION_LABELS.VM_ID]: vmId },
    },
    status: {
      phase,
      inspectionResult:
        allChecksPassed !== undefined || all_checks_passed !== undefined
          ? { allChecksPassed, all_checks_passed }
          : undefined,
    },
    ...rest,
  } as V1beta1Conversion;
};

describe('useVmInspectionStatus - selection', () => {
  it('returns undefined when no conversion exists for the vm', () => {
    const { result } = renderHook(() => useVmInspectionStatus([]));
    expect(result.current('vm-missing')).toBeUndefined();
  });

  it('ignores conversions without vmID label', () => {
    const unlabeled = conversion();
    delete unlabeled.metadata!.labels;
    const { result } = renderHook(() => useVmInspectionStatus([unlabeled]));
    expect(result.current('vm-1')).toBeUndefined();
  });

  it('prefers an active conversion over a newer completed one', () => {
    const completed = conversion({
      createdAt: '2024-02-01T00:00:00Z',
      phase: CONVERSION_PHASE.SUCCEEDED,
      allChecksPassed: true,
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

  it('prefers the newer conversion when both are inactive', () => {
    const older = conversion({
      createdAt: '2024-01-01T00:00:00Z',
      phase: CONVERSION_PHASE.FAILED,
    });
    const newer = conversion({
      createdAt: '2024-03-01T00:00:00Z',
      phase: CONVERSION_PHASE.SUCCEEDED,
      allChecksPassed: true,
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
      all_checks_passed: false,
      phase: CONVERSION_PHASE.SUCCEEDED,
      vmId: 'vm-2',
    });

    const { result } = renderHook(() => useVmInspectionStatus([withCamel, withSnake]));
    expect(result.current('vm-1')?.status).toBe(INSPECTION_STATUS.ISSUES_FOUND);
    expect(result.current('vm-1')?.inspectionPassed).toBe(false);
    expect(result.current('vm-2')?.status).toBe(INSPECTION_STATUS.ISSUES_FOUND);
  });

  it('exposes conversion name and lastRun from metadata', () => {
    const item = conversion({
      createdAt: '2024-05-05T12:00:00Z',
      allChecksPassed: true,
    });
    item.metadata!.name = 'inspect-vm-1';

    const { result } = renderHook(() => useVmInspectionStatus([item]));
    const status = result.current('vm-1');

    expect(status?.conversionName).toBe('inspect-vm-1');
    expect(status?.lastRun).toBe('2024-05-05T12:00:00Z');
  });
});

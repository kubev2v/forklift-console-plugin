import { CONVERSION_LABELS, CONVERSION_PHASE } from '@utils/crds/conversion/constants';
import type { V1beta1Conversion } from '@utils/crds/conversion/types';

type ConversionOverrides = Partial<V1beta1Conversion> & {
  allChecksPassed?: boolean;
  createdAt?: string;
  phase?: string;
  snakeAllChecksPassed?: boolean;
  vmId?: string;
};

export const conversion = (overrides: ConversionOverrides = {}): V1beta1Conversion => {
  const {
    allChecksPassed,
    createdAt = '2024-01-01T00:00:00Z',
    phase = CONVERSION_PHASE.SUCCEEDED,
    snakeAllChecksPassed,
    vmId = 'vm-1',
    ...rest
  } = overrides;

  const inspectionResult: Record<string, boolean> = {};
  if (typeof allChecksPassed === 'boolean') {
    inspectionResult.allChecksPassed = allChecksPassed;
  }
  if (typeof snakeAllChecksPassed === 'boolean') {
    const snakeCaseFlag = 'all_checks_passed';
    inspectionResult[snakeCaseFlag] = snakeAllChecksPassed;
  }
  const hasInspectionResult = Object.keys(inspectionResult).length > 0;

  return {
    apiVersion: 'forklift.konveyor.io/v1beta1',
    kind: 'Conversion',
    metadata: {
      creationTimestamp: createdAt,
      labels: { [CONVERSION_LABELS.VM_ID]: vmId },
      name: `conversion-${vmId}-${createdAt}`,
    },
    status: {
      inspectionResult: hasInspectionResult ? inspectionResult : undefined,
      phase,
    },
    ...rest,
  } as V1beta1Conversion;
};

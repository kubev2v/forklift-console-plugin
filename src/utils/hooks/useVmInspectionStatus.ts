import { useCallback, useMemo } from 'react';

import { getCreatedAt, getLabels, getName } from '@utils/crds/common/selectors';
import type { InspectionStatus } from '@utils/crds/conversion/constants';
import { CONVERSION_LABELS } from '@utils/crds/conversion/constants';
import {
  getConversionPhase,
  getInspectionResult,
  getInspectionStatus,
  hasInspectionPassed,
  isConversionActive,
} from '@utils/crds/conversion/selectors';

import type { V1beta1Conversion } from '../crds/conversion/types';

export type VmInspectionStatus = {
  conversion: V1beta1Conversion;
  conversionName: string | undefined;
  inspectionPassed: boolean | undefined;
  lastRun: string | undefined;
  status: InspectionStatus;
};

type GetVmInspectionStatusFn = (vmId: string) => VmInspectionStatus | undefined;

const shouldReplace = (existing: V1beta1Conversion, candidate: V1beta1Conversion): boolean => {
  const candidateActive = isConversionActive(candidate);
  const existingActive = isConversionActive(existing);

  if (candidateActive && !existingActive) return true;
  if (!candidateActive && existingActive) return false;

  return (getCreatedAt(candidate) ?? '') > (getCreatedAt(existing) ?? '');
};

export const useVmInspectionStatus = (
  conversions: V1beta1Conversion[],
): GetVmInspectionStatusFn => {
  const vmStatusMap = useMemo(() => {
    const map = new Map<string, V1beta1Conversion>();

    conversions
      .filter((conversion) => getLabels(conversion)?.[CONVERSION_LABELS.VM_ID])
      .forEach((conversion) => {
        const vmId = getLabels(conversion)?.[CONVERSION_LABELS.VM_ID] ?? '';
        const existing = map.get(vmId);

        if (!existing || shouldReplace(existing, conversion)) {
          map.set(vmId, conversion);
        }
      });

    return map;
  }, [conversions]);

  return useCallback(
    (vmId: string): VmInspectionStatus | undefined => {
      const conversion = vmStatusMap.get(vmId);
      if (!conversion) return undefined;

      const phase = getConversionPhase(conversion);
      const inspectionPassed = hasInspectionPassed(getInspectionResult(conversion));

      return {
        conversion,
        conversionName: getName(conversion),
        inspectionPassed,
        lastRun: getCreatedAt(conversion),
        status: getInspectionStatus(phase, inspectionPassed),
      };
    },
    [vmStatusMap],
  );
};

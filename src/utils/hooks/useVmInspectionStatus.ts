import { useCallback, useMemo } from 'react';

import { CONVERSION_LABELS } from '@utils/crds/conversion/constants';
import {
  getConversionCreationTimestamp,
  getConversionPhase,
  isConversionActive,
} from '@utils/crds/conversion/selectors';

import type { ConversionPhase, V1beta1Conversion } from '../crds/conversion/types';

export type VmInspectionStatus = {
  conversion: V1beta1Conversion;
  conversionName: string | undefined;
  lastRun: string | undefined;
  phase: ConversionPhase | undefined;
};

type GetVmInspectionStatusFn = (vmId: string) => VmInspectionStatus | undefined;

const shouldReplace = (existing: V1beta1Conversion, candidate: V1beta1Conversion): boolean => {
  const candidateActive = isConversionActive(candidate);
  const existingActive = isConversionActive(existing);

  if (candidateActive && !existingActive) return true;
  if (!candidateActive && existingActive) return false;

  return (
    (getConversionCreationTimestamp(candidate) ?? '') >
    (getConversionCreationTimestamp(existing) ?? '')
  );
};

export const useVmInspectionStatus = (
  conversions: V1beta1Conversion[],
): GetVmInspectionStatusFn => {
  const vmStatusMap = useMemo(() => {
    const map = new Map<string, V1beta1Conversion>();

    conversions
      .filter((conversion) => conversion?.metadata?.labels?.[CONVERSION_LABELS.VM_ID])
      .forEach((conversion) => {
        const vmId = conversion.metadata?.labels?.[CONVERSION_LABELS.VM_ID] ?? '';
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

      return {
        conversion,
        conversionName: conversion.metadata?.name,
        lastRun: getConversionCreationTimestamp(conversion),
        phase: getConversionPhase(conversion),
      };
    },
    [vmStatusMap],
  );
};

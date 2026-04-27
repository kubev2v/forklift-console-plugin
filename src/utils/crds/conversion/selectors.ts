import { ACTIVE_CONVERSION_PHASES, CONVERSION_LABELS } from './constants';
import type {
  ConversionCondition,
  ConversionPhase,
  ConversionStatus,
  V1beta1Conversion,
} from './types';

export const getConversionPhase = (conversion: V1beta1Conversion): ConversionPhase | undefined =>
  conversion?.status?.phase;

export const getConversionVmId = (conversion: V1beta1Conversion): string | undefined =>
  conversion?.metadata?.labels?.[CONVERSION_LABELS.VM_ID];

export const getConversionType = (conversion: V1beta1Conversion): string | undefined =>
  conversion?.metadata?.labels?.[CONVERSION_LABELS.CONVERSION_TYPE];

export const getConversionPodRef = (conversion: V1beta1Conversion): ConversionStatus['pod'] =>
  conversion?.status?.pod;

export const getConversionConditions = (
  conversion: V1beta1Conversion,
): ConversionCondition[] | undefined => conversion?.status?.conditions;

export const getConversionCreationTimestamp = (conversion: V1beta1Conversion): string | undefined =>
  conversion?.metadata?.creationTimestamp;

export const isConversionActive = (conversion: V1beta1Conversion): boolean => {
  const phase = getConversionPhase(conversion);
  return phase !== undefined && (ACTIVE_CONVERSION_PHASES as Set<string>).has(phase);
};

export const getCriticalConditions = (conversion: V1beta1Conversion): ConversionCondition[] =>
  (getConversionConditions(conversion) ?? []).filter(
    (condition) => condition.category === 'Critical' && condition.status === 'True',
  );

import { ACTIVE_CONVERSION_PHASES } from './constants';
import type {
  ConversionCondition,
  ConversionPhase,
  ConversionStatus,
  V1beta1Conversion,
} from './types';

export const getConversionPhase = (conversion: V1beta1Conversion): ConversionPhase | undefined =>
  conversion?.status?.phase;

export const getConversionPodRef = (conversion: V1beta1Conversion): ConversionStatus['pod'] =>
  conversion?.status?.pod;

export const getConversionCreationTimestamp = (conversion: V1beta1Conversion): string | undefined =>
  conversion?.metadata?.creationTimestamp;

export const isConversionActive = (conversion: V1beta1Conversion): boolean => {
  const phase = getConversionPhase(conversion);
  return phase !== undefined && (ACTIVE_CONVERSION_PHASES as Set<string>).has(phase);
};

export const getCriticalConditions = (conversion: V1beta1Conversion): ConversionCondition[] =>
  (conversion?.status?.conditions ?? []).filter(
    (condition) => condition.category === 'Critical' && condition.status === 'True',
  );

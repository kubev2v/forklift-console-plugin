import { ACTIVE_CONVERSION_PHASES } from './constants';
import type {
  ConversionCondition,
  ConversionPhase,
  ConversionStatus,
  InspectionResult,
  V1beta1Conversion,
} from './types';

export const getConversionPhase = (conversion: V1beta1Conversion): ConversionPhase | undefined =>
  conversion?.status?.phase;

export const getConversionPodRef = (conversion: V1beta1Conversion): ConversionStatus['pod'] =>
  conversion?.status?.pod;

export const getConversionCreationTimestamp = (conversion: V1beta1Conversion): string | undefined =>
  conversion?.metadata?.creationTimestamp;

export const getInspectionResult = (conversion: V1beta1Conversion): InspectionResult | undefined =>
  conversion?.status?.inspectionResult;

export const isConversionActive = (conversion: V1beta1Conversion): boolean => {
  const phase = getConversionPhase(conversion);
  return phase !== undefined && ACTIVE_CONVERSION_PHASES.has(phase);
};

export const getCriticalConditions = (conversion: V1beta1Conversion): ConversionCondition[] =>
  (conversion?.status?.conditions ?? []).filter(
    (condition) => condition.category === 'Critical' && condition.status === 'True',
  );

import { isEmpty } from '@utils/helpers';

import {
  ACTIVE_CONVERSION_PHASES,
  CONVERSION_PHASE,
  INSPECTION_STATUS,
  type InspectionStatus,
} from './constants';
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

export const getInspectionResult = (conversion: V1beta1Conversion): InspectionResult | undefined =>
  conversion?.status?.inspectionResult;

/** Handles backend snake_case bug: reads both `allChecksPassed` and `all_checks_passed`. */
export const hasInspectionPassed = (result: InspectionResult | undefined): boolean | undefined => {
  if (!result) return undefined;
  const value = result.allChecksPassed ?? result.all_checks_passed;
  if (value !== undefined) return value;
  if (!isEmpty(result.concerns)) return false;
  return undefined;
};

export const getInspectionStatus = (
  phase: ConversionPhase | undefined,
  inspectionPassed: boolean | undefined,
): InspectionStatus => {
  if (!phase) return INSPECTION_STATUS.NOT_INSPECTED;

  switch (phase) {
    case CONVERSION_PHASE.SUCCEEDED:
      if (inspectionPassed === false) return INSPECTION_STATUS.ISSUES_FOUND;
      return INSPECTION_STATUS.INSPECTION_PASSED;
    case CONVERSION_PHASE.FAILED:
      return INSPECTION_STATUS.FAILED;
    case CONVERSION_PHASE.CANCELED:
      return INSPECTION_STATUS.CANCELED;
    case CONVERSION_PHASE.RUNNING:
      return INSPECTION_STATUS.RUNNING;
    case CONVERSION_PHASE.PENDING:
    default:
      return INSPECTION_STATUS.PENDING;
  }
};

export const isConversionActive = (conversion: V1beta1Conversion): boolean => {
  const phase = getConversionPhase(conversion);
  return phase !== undefined && ACTIVE_CONVERSION_PHASES.has(phase);
};

export const getCriticalConditions = (conversion: V1beta1Conversion): ConversionCondition[] =>
  (conversion?.status?.conditions ?? []).filter(
    (condition) => condition.category === 'Critical' && condition.status === 'True',
  );

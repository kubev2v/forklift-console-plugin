import { INSPECTION_STATUS_NOT_INSPECTED } from '@utils/crds/conversion/constants';

/**
 * Narrows ResourceField jsonPath `unknown` items to the inspection status string.
 */
export const getInspectionStatusLabel = (item: unknown): string => {
  if (typeof item !== 'object' || item === null || !('inspectionStatus' in item)) {
    return INSPECTION_STATUS_NOT_INSPECTED;
  }

  const { inspectionStatus } = item;
  if (
    typeof inspectionStatus !== 'object' ||
    inspectionStatus === null ||
    !('status' in inspectionStatus)
  ) {
    return INSPECTION_STATUS_NOT_INSPECTED;
  }

  const { status } = inspectionStatus;
  return typeof status === 'string' ? status : INSPECTION_STATUS_NOT_INSPECTED;
};

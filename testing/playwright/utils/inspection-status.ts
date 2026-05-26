/**
 * UI inspection status labels rendered by getInspectionStatusConfig.
 * See src/utils/crds/conversion/constants.ts (INSPECTION_STATUS) for enum values.
 */
export const INSPECTION_STATUS_LABEL = {
  CANCELED: 'Canceled',
  INSPECTION_ERROR: 'Inspection error',
  INSPECTION_PASSED: 'Inspection passed',
  ISSUES_FOUND: 'Issues found',
  NOT_INSPECTED: 'Not inspected',
  PENDING: 'Pending',
  RUNNING: 'Running',
} as const;

/** Terminal inspection statuses shown in the VMs table. */
export const COMPLETED_STATUSES = /Inspection passed|Issues found|Inspection error|Canceled/;

/** Running or any terminal status except Canceled. */
export const ACTIVE_OR_COMPLETED_STATUSES =
  /Running|Inspection passed|Issues found|Inspection error/;

const DISPLAY_TO_FILTER_ID: Record<string, string> = {
  [INSPECTION_STATUS_LABEL.CANCELED]: 'Canceled',
  [INSPECTION_STATUS_LABEL.INSPECTION_ERROR]: 'Failed',
  [INSPECTION_STATUS_LABEL.INSPECTION_PASSED]: 'Inspection passed',
  [INSPECTION_STATUS_LABEL.ISSUES_FOUND]: 'Issues found',
  [INSPECTION_STATUS_LABEL.NOT_INSPECTED]: 'Not inspected',
  [INSPECTION_STATUS_LABEL.PENDING]: 'Pending',
  [INSPECTION_STATUS_LABEL.RUNNING]: 'Running',
};

export const inspectionStatusDisplayToFilterId = (displayStatus: string): string => {
  const filterId = DISPLAY_TO_FILTER_ID[displayStatus];
  if (!filterId) {
    throw new Error(`Unknown inspection status display label: ${displayStatus}`);
  }
  return filterId;
};

export const isCompletedInspectionStatus = (status: string): boolean =>
  COMPLETED_STATUSES.test(status);

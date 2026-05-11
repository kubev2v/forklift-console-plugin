export const CONVERSION_TYPE = {
  DEEP_INSPECTION: 'DeepInspection',
  IN_PLACE: 'InPlace',
  INSPECTION: 'Inspection',
  REMOTE: 'Remote',
} as const;

export const CONVERSION_PHASE = {
  CANCELED: 'Canceled',
  FAILED: 'Failed',
  PENDING: 'Pending',
  RUNNING: 'Running',
  SUCCEEDED: 'Succeeded',
} as const;

export const CONVERSION_LABELS = {
  APP: 'forklift.app',
  CONVERSION: 'conversion',
  CONVERSION_TYPE: 'conversion-type',
  MIGRATION: 'migration',
  PLAN: 'plan',
  PLAN_NAME: 'plan-name',
  PLAN_NAMESPACE: 'plan-namespace',
  PROVIDER: 'provider',
  VM_ID: 'vmID',
} as const;

export const ACTIVE_CONVERSION_PHASES: ReadonlySet<string> = new Set<string>([
  CONVERSION_PHASE.PENDING,
  CONVERSION_PHASE.RUNNING,
]);

export const DISK_ENCRYPTION_TYPE = {
  CLEVIS: 'Clevis',
  LUKS: 'LUKS',
} as const;

export const INSPECTION_STATUS = {
  CANCELED: 'Canceled',
  FAILED: 'Failed',
  INSPECTION_PASSED: 'Inspection passed',
  ISSUES_FOUND: 'Issues found',
  NOT_INSPECTED: 'Not inspected',
  PENDING: 'Pending',
  RUNNING: 'Running',
} as const;

export type InspectionStatus = (typeof INSPECTION_STATUS)[keyof typeof INSPECTION_STATUS];

export const MAX_PASSPHRASES = 20;

export const INSPECTION_STATUS_NOT_INSPECTED = INSPECTION_STATUS.NOT_INSPECTED;

export const INSPECTION_STATUS_FILTER_VALUES = [
  INSPECTION_STATUS.NOT_INSPECTED,
  INSPECTION_STATUS.PENDING,
  INSPECTION_STATUS.RUNNING,
  INSPECTION_STATUS.INSPECTION_PASSED,
  INSPECTION_STATUS.ISSUES_FOUND,
  INSPECTION_STATUS.FAILED,
  INSPECTION_STATUS.CANCELED,
] as const;

export const CONCURRENCY_LIMIT = 10;

export const INSPECTION_TABLE_COLUMN_COUNT = 5;

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

export const INSPECTION_STATUS_NOT_INSPECTED = 'Not inspected';

export const INSPECTION_STATUS_FILTER_VALUES = [
  INSPECTION_STATUS_NOT_INSPECTED,
  CONVERSION_PHASE.PENDING,
  CONVERSION_PHASE.RUNNING,
  CONVERSION_PHASE.SUCCEEDED,
  CONVERSION_PHASE.FAILED,
  CONVERSION_PHASE.CANCELED,
] as const;

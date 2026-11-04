import { PIPELINE_STEP_NAMES } from '@utils/constants';

export const MIGRATION_PERFORMANCE_STATUS = {
  CANCELED: 'Canceled',
  FAILED: 'Failed',
  PARTIAL: 'Partial',
  PENDING: 'Pending',
  RUNNING: 'Running',
  SUCCEEDED: 'Succeeded',
} as const;

export type MigrationPerformanceStatus =
  (typeof MIGRATION_PERFORMANCE_STATUS)[keyof typeof MIGRATION_PERFORMANCE_STATUS];

export const MILLISECONDS_PER_SECOND = 1000;
export const BYTES_PER_MIB = 1024 * 1024;
export const MIN_COPY_TIME_DIFFERENCE_SECONDS = 60;

export const DISK_TRANSFER_STEPS: string[] = [
  PIPELINE_STEP_NAMES.DISK_TRANSFER,
  PIPELINE_STEP_NAMES.DISK_TRANSFER_V2V,
];

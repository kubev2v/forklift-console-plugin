export const MIGRATION_ALERT_NAMES = ['MigrationFailed', 'MigrationSucceeded'] as const;

export const MIGRATION_ALERT_NAME = {
  FAILED: 'MigrationFailed',
  SUCCEEDED: 'MigrationSucceeded',
} as const;

export const MONITORING_ALERTS_PATH = '/monitoring/alerts';

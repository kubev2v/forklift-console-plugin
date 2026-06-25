import type { AlertSeverity, AlertStates } from '@openshift-console/dynamic-plugin-sdk';

import type { MIGRATION_ALERT_NAMES } from './constants';

export type MigrationAlertName = (typeof MIGRATION_ALERT_NAMES)[number];

export type MigrationAlert = {
  activeAt: string;
  alertName: MigrationAlertName;
  description: string;
  mode: string;
  phase: string;
  planName: string;
  planUid: string;
  provider: string;
  severity: AlertSeverity | string;
  state: AlertStates | string;
  target: string;
};

export type UseMigrationAlertsResult = {
  alerts: MigrationAlert[];
  error: unknown;
  loaded: boolean;
};

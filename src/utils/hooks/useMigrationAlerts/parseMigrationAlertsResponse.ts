import type {
  PrometheusAlert,
  PrometheusRulesResponse,
} from '@openshift-console/dynamic-plugin-sdk';

import { MIGRATION_ALERT_NAMES } from './constants';
import type { MigrationAlert, MigrationAlertName } from './types';

const isMigrationAlertName = (name: string): name is MigrationAlertName =>
  MIGRATION_ALERT_NAMES.includes(name as MigrationAlertName);

const ACTIVE_STATES = new Set<string>(['firing', 'pending']);

const mapAlertToMigrationAlert = (
  alert: PrometheusAlert,
  ruleName: MigrationAlertName,
  ruleSeverity: string,
): MigrationAlert => ({
  activeAt: alert.activeAt ?? '',
  alertName: ruleName,
  description: alert.annotations?.description ?? alert.annotations?.summary ?? '',
  mode: alert.labels.mode ?? '',
  phase: alert.labels.phase ?? '',
  planName: alert.labels.plan_name ?? '',
  planUid: alert.labels.plan ?? '',
  provider: alert.labels.provider ?? '',
  severity: alert.labels.severity ?? ruleSeverity,
  state: alert.state,
  target: alert.labels.target ?? '',
});

export const parseMigrationAlertsResponse = (
  response: PrometheusRulesResponse | undefined,
): MigrationAlert[] => {
  if (!response?.data?.groups) {
    return [];
  }

  return response.data.groups
    .flatMap((group) => group.rules)
    .filter((rule) => isMigrationAlertName(rule.name))
    .flatMap((rule) =>
      rule.alerts
        .filter((alert) => ACTIVE_STATES.has(alert.state))
        .map((alert) =>
          mapAlertToMigrationAlert(
            alert,
            rule.name as MigrationAlertName,
            rule.labels?.severity ?? '',
          ),
        ),
    );
};

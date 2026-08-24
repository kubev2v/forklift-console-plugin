import type {
  PrometheusAlert,
  PrometheusRule,
  PrometheusRulesResponse,
} from '@openshift-console/dynamic-plugin-sdk';

export const STATUS_SUCCESS = 'success';
const FIRING_ALERT_STATE = 'firing' as PrometheusAlert['state'];
const FIRING_RULE_STATE = 'firing' as PrometheusRule['state'];

type RulesGroup = PrometheusRulesResponse['data']['groups'][number];
type RulesGroupInput = Pick<RulesGroup, 'rules'>;

export const createRulesResponse = (groups: RulesGroupInput[]): PrometheusRulesResponse => ({
  data: {
    groups: groups.map((group, index) => ({
      file: `rules-${index}.yaml`,
      name: `group-${index}`,
      ...group,
    })),
  },
  status: STATUS_SUCCESS,
});

export const createMigrationFailedRule = (alerts: PrometheusAlert[] = []): PrometheusRule => ({
  alerts,
  annotations: {},
  duration: 0,
  labels: { severity: 'critical' },
  name: 'MigrationFailed',
  query: 'mtv_plan_alert_status{status="Failed"}',
  state: FIRING_RULE_STATE,
  type: 'alerting',
});

export const createMigrationSucceededRule = (alerts: PrometheusAlert[] = []): PrometheusRule => ({
  alerts,
  annotations: {},
  duration: 0,
  labels: { severity: 'info' },
  name: 'MigrationSucceeded',
  query: 'mtv_plan_alert_status{status="Succeeded"}',
  state: FIRING_RULE_STATE,
  type: 'alerting',
});

export const createFiringAlert = (overrides: Record<string, string> = {}): PrometheusAlert => ({
  activeAt: '2026-06-23T14:30:00Z',
  annotations: {
    description:
      'Cold migration plan "my-plan" with VSphere provider failed on DiskTransfer phase.',
  },
  labels: {
    alertname: 'MigrationFailed',
    mode: 'Cold',
    phase: 'DiskTransfer',
    plan: 'uid-123',
    plan_name: 'my-plan', // eslint-disable-line camelcase
    provider: 'VSphere',
    severity: 'critical',
    target: 'Local',
    ...overrides,
  },
  state: FIRING_ALERT_STATE,
});

export const createSucceededAlert = (overrides: Record<string, string> = {}): PrometheusAlert => ({
  activeAt: '2026-06-24T10:00:00Z',
  annotations: { description: 'Migration plan "completed-plan" succeeded.' },
  labels: {
    alertname: 'MigrationSucceeded',
    mode: 'Cold',
    phase: 'Completed',
    plan: 'uid-456',
    plan_name: 'completed-plan', // eslint-disable-line camelcase
    provider: 'oVirt',
    severity: 'info',
    target: 'Local',
    ...overrides,
  },
  state: FIRING_ALERT_STATE,
});

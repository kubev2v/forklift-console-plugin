import type {
  PrometheusAlert,
  PrometheusRule,
  PrometheusRulesResponse,
} from '@openshift-console/dynamic-plugin-sdk';

export const STATUS_SUCCESS = 'success';
const FIRING_ALERT_STATE = 'firing' as PrometheusAlert['state'];
const FIRING_RULE_STATE = 'firing' as PrometheusRule['state'];
const PLAN_NAME_LABEL = 'plan_name';

type AlertLabels = PrometheusAlert['labels'];
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

export const createFiringAlert = (overrides: Partial<AlertLabels> = {}): PrometheusAlert => {
  const labels = {
    alertname: 'MigrationFailed',
    mode: 'Cold',
    phase: 'DiskTransfer',
    plan: 'uid-123',
    provider: 'VSphere',
    severity: 'critical',
    target: 'Local',
    [PLAN_NAME_LABEL]: 'my-plan',
  } as AlertLabels;

  return {
    activeAt: '2026-06-23T14:30:00Z',
    annotations: {
      description:
        'Cold migration plan "my-plan" with VSphere provider failed on DiskTransfer phase.',
    },
    labels: { ...labels, ...overrides } as AlertLabels,
    state: FIRING_ALERT_STATE,
  };
};

export const createSucceededAlert = (overrides: Partial<AlertLabels> = {}): PrometheusAlert => {
  const labels = {
    alertname: 'MigrationSucceeded',
    mode: 'Cold',
    phase: 'Completed',
    plan: 'uid-456',
    provider: 'oVirt',
    severity: 'info',
    target: 'Local',
    [PLAN_NAME_LABEL]: 'completed-plan',
  } as AlertLabels;

  return {
    activeAt: '2026-06-24T10:00:00Z',
    annotations: { description: 'Migration plan "completed-plan" succeeded.' },
    labels: { ...labels, ...overrides } as AlertLabels,
    state: FIRING_ALERT_STATE,
  };
};

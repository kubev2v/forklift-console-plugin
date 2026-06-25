import type { PrometheusRulesResponse } from '@openshift-console/dynamic-plugin-sdk';

import { parseMigrationAlertsResponse } from '../parseMigrationAlertsResponse';

const STATUS_SUCCESS = 'success';

type RulesGroup = PrometheusRulesResponse['data']['groups'][number];
type RulesRule = RulesGroup['rules'][number];
type RulesAlert = RulesRule['alerts'][number];

const createRulesResponse = (groups: Partial<RulesGroup>[]): PrometheusRulesResponse =>
  ({
    data: { groups },
    status: STATUS_SUCCESS,
  }) as unknown as PrometheusRulesResponse;

const createMigrationFailedRule = (alerts: Partial<RulesAlert>[] = []): RulesRule =>
  ({
    alerts: alerts as RulesAlert[],
    annotations: {},
    duration: 0,
    labels: { severity: 'critical' },
    name: 'MigrationFailed',
    query: 'mtv_plan_alert_status{status="Failed"}',
    state: 'firing',
    type: 'alerting',
  }) as unknown as RulesRule;

const createMigrationSucceededRule = (alerts: Partial<RulesAlert>[] = []): RulesRule =>
  ({
    alerts: alerts as RulesAlert[],
    annotations: {},
    duration: 0,
    labels: { severity: 'info' },
    name: 'MigrationSucceeded',
    query: 'mtv_plan_alert_status{status="Succeeded"}',
    state: 'firing',
    type: 'alerting',
  }) as unknown as RulesRule;

const createFiringAlert = (overrides: Record<string, string> = {}): Partial<RulesAlert> => ({
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
  state: 'firing' as unknown as RulesAlert['state'],
});

const createSucceededAlert = (overrides: Record<string, string> = {}): Partial<RulesAlert> => ({
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
  state: 'firing' as unknown as RulesAlert['state'],
});

describe('parseMigrationAlertsResponse', () => {
  test('returns empty array for undefined response', () => {
    expect(parseMigrationAlertsResponse(undefined)).toEqual([]);
  });

  test('returns empty array when response has no groups', () => {
    const response = { data: { groups: [] }, status: STATUS_SUCCESS } as PrometheusRulesResponse;
    expect(parseMigrationAlertsResponse(response)).toEqual([]);
  });

  test('returns empty array when response data is undefined', () => {
    const response = {
      data: undefined,
      status: STATUS_SUCCESS,
    } as unknown as PrometheusRulesResponse;
    expect(parseMigrationAlertsResponse(response)).toEqual([]);
  });

  test('extracts MigrationFailed alert with all label fields', () => {
    const response = createRulesResponse([
      { rules: [createMigrationFailedRule([createFiringAlert()])] },
    ]);

    const result = parseMigrationAlertsResponse(response);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      activeAt: '2026-06-23T14:30:00Z',
      alertName: 'MigrationFailed',
      description:
        'Cold migration plan "my-plan" with VSphere provider failed on DiskTransfer phase.',
      mode: 'Cold',
      phase: 'DiskTransfer',
      planName: 'my-plan',
      planUid: 'uid-123',
      provider: 'VSphere',
      severity: 'critical',
      state: 'firing',
      target: 'Local',
    });
  });

  test('extracts MigrationSucceeded alert', () => {
    const response = createRulesResponse([
      { rules: [createMigrationSucceededRule([createSucceededAlert()])] },
    ]);

    const result = parseMigrationAlertsResponse(response);

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      activeAt: '2026-06-24T10:00:00Z',
      alertName: 'MigrationSucceeded',
      description: 'Migration plan "completed-plan" succeeded.',
      mode: 'Cold',
      phase: 'Completed',
      planName: 'completed-plan',
      planUid: 'uid-456',
      provider: 'oVirt',
      severity: 'info',
      state: 'firing',
      target: 'Local',
    });
  });

  test('filters out non-MTV alert rules', () => {
    const unrelatedRule = {
      alerts: [
        {
          annotations: {},
          labels: { alertname: 'NodeDown', severity: 'critical' },
          state: 'firing',
        },
      ],
      annotations: {},
      duration: 0,
      labels: { severity: 'critical' },
      name: 'NodeDown',
      query: 'up == 0',
      state: 'firing',
      type: 'alerting',
    } as unknown as RulesRule;

    const response = createRulesResponse([
      { rules: [unrelatedRule, createMigrationFailedRule([createFiringAlert()])] },
    ]);

    const result = parseMigrationAlertsResponse(response);
    expect(result).toHaveLength(1);
    expect(result[0].alertName).toBe('MigrationFailed');
  });

  test('handles missing labels gracefully with empty string defaults', () => {
    const alertWithMissingLabels: Partial<RulesAlert> = {
      annotations: {},
      labels: { alertname: 'MigrationFailed', severity: 'critical' },
      state: 'firing' as unknown as RulesAlert['state'],
    };

    const response = createRulesResponse([
      { rules: [createMigrationFailedRule([alertWithMissingLabels])] },
    ]);

    const result = parseMigrationAlertsResponse(response);

    expect(result).toHaveLength(1);
    expect(result[0].planName).toBe('');
    expect(result[0].planUid).toBe('');
    expect(result[0].provider).toBe('');
    expect(result[0].mode).toBe('');
    expect(result[0].phase).toBe('');
    expect(result[0].target).toBe('');
  });

  test('includes alerts in pending state', () => {
    const pendingAlert: Partial<RulesAlert> = {
      ...createFiringAlert(),
      state: 'pending' as unknown as RulesAlert['state'],
    };

    const response = createRulesResponse([{ rules: [createMigrationFailedRule([pendingAlert])] }]);

    const result = parseMigrationAlertsResponse(response);

    expect(result).toHaveLength(1);
    expect(result[0].state).toBe('pending');
  });

  test('excludes alerts that are not firing or pending', () => {
    const inactiveAlert: Partial<RulesAlert> = {
      ...createFiringAlert(),
      state: 'not-firing' as unknown as RulesAlert['state'],
    };

    const response = createRulesResponse([{ rules: [createMigrationFailedRule([inactiveAlert])] }]);

    const result = parseMigrationAlertsResponse(response);
    expect(result).toHaveLength(0);
  });

  test('handles multiple alerts for different plans', () => {
    // eslint-disable-next-line camelcase
    const alert1 = createFiringAlert({ plan: 'uid-1', plan_name: 'plan-a' });
    const alert2 = createFiringAlert({
      plan: 'uid-2',
      plan_name: 'plan-b', // eslint-disable-line camelcase
      phase: 'ImageConversion',
    });

    const response = createRulesResponse([
      { rules: [createMigrationFailedRule([alert1, alert2])] },
    ]);

    const result = parseMigrationAlertsResponse(response);

    expect(result).toHaveLength(2);
    expect(result[0].planName).toBe('plan-a');
    expect(result[1].planName).toBe('plan-b');
    expect(result[1].phase).toBe('ImageConversion');
  });

  test('handles both rule types in the same group', () => {
    const response = createRulesResponse([
      {
        rules: [
          createMigrationFailedRule([createFiringAlert()]),
          createMigrationSucceededRule([createSucceededAlert()]),
        ],
      },
    ]);

    const result = parseMigrationAlertsResponse(response);

    expect(result).toHaveLength(2);
    expect(result[0].alertName).toBe('MigrationFailed');
    expect(result[1].alertName).toBe('MigrationSucceeded');
  });

  test('falls back to rule-level severity when alert label is missing', () => {
    const alertNoSeverity: Partial<RulesAlert> = {
      annotations: {},
      labels: { alertname: 'MigrationFailed', plan: 'uid-1', plan_name: 'test' }, // eslint-disable-line camelcase
      state: 'firing' as unknown as RulesAlert['state'],
    };

    const response = createRulesResponse([
      { rules: [createMigrationFailedRule([alertNoSeverity])] },
    ]);

    const result = parseMigrationAlertsResponse(response);

    expect(result).toHaveLength(1);
    expect(result[0].severity).toBe('critical');
  });
});

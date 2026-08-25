import type { PrometheusAlert } from '@openshift-console/dynamic-plugin-sdk';

import { parseMigrationAlertsResponse } from '../parseMigrationAlertsResponse';

import {
  createFiringAlert,
  createMigrationFailedRule,
  createMigrationSucceededRule,
  createRulesResponse,
  createSucceededAlert,
} from './parseMigrationAlertsResponse.fixtures';

describe('parseMigrationAlertsResponse - extraction', () => {
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

  test('handles missing labels gracefully with empty string defaults', () => {
    const alertWithMissingLabels: PrometheusAlert = {
      annotations: {},
      labels: { alertname: 'MigrationFailed', severity: 'critical' },
      state: 'firing' as PrometheusAlert['state'],
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

  test('falls back to rule-level severity when alert label is missing', () => {
    const planNameLabel = 'plan_name';
    const alertNoSeverity: PrometheusAlert = {
      annotations: {},
      labels: {
        alertname: 'MigrationFailed',
        plan: 'uid-1',
        [planNameLabel]: 'test',
      },
      state: 'firing' as PrometheusAlert['state'],
    };

    const response = createRulesResponse([
      { rules: [createMigrationFailedRule([alertNoSeverity])] },
    ]);

    const result = parseMigrationAlertsResponse(response);

    expect(result).toHaveLength(1);
    expect(result[0].severity).toBe('critical');
  });
});

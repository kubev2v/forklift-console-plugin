import type { PrometheusAlert, PrometheusRule } from '@openshift-console/dynamic-plugin-sdk';

import { parseMigrationAlertsResponse } from '../parseMigrationAlertsResponse';

import {
  createFiringAlert,
  createMigrationFailedRule,
  createMigrationSucceededRule,
  createRulesResponse,
  createSucceededAlert,
} from './parseMigrationAlertsResponse.fixtures';

describe('parseMigrationAlertsResponse - filtering', () => {
  test('filters out non-MTV alert rules', () => {
    const unrelatedRule: PrometheusRule = {
      alerts: [
        {
          annotations: {},
          labels: { alertname: 'NodeDown', severity: 'critical' },
          state: 'firing' as PrometheusAlert['state'],
        },
      ],
      annotations: {},
      duration: 0,
      labels: { severity: 'critical' },
      name: 'NodeDown',
      query: 'up == 0',
      state: 'firing' as PrometheusRule['state'],
      type: 'alerting',
    };

    const response = createRulesResponse([
      { rules: [unrelatedRule, createMigrationFailedRule([createFiringAlert()])] },
    ]);

    const result = parseMigrationAlertsResponse(response);
    expect(result).toHaveLength(1);
    expect(result[0].alertName).toBe('MigrationFailed');
  });

  test('includes alerts in pending state', () => {
    const pendingAlert: PrometheusAlert = {
      ...createFiringAlert(),
      state: 'pending' as PrometheusAlert['state'],
    };

    const response = createRulesResponse([{ rules: [createMigrationFailedRule([pendingAlert])] }]);

    const result = parseMigrationAlertsResponse(response);

    expect(result).toHaveLength(1);
    expect(result[0].state).toBe('pending');
  });

  test('excludes alerts that are not firing or pending', () => {
    const inactiveAlert: PrometheusAlert = {
      ...createFiringAlert(),
      state: 'not-firing' as PrometheusAlert['state'],
    };

    const response = createRulesResponse([{ rules: [createMigrationFailedRule([inactiveAlert])] }]);

    const result = parseMigrationAlertsResponse(response);
    expect(result).toHaveLength(0);
  });

  test('handles multiple alerts for different plans', () => {
    const planNameLabel = 'plan_name';
    const alert1 = createFiringAlert({
      plan: 'uid-1',
      [planNameLabel]: 'plan-a',
    });

    const alert2 = createFiringAlert({
      phase: 'ImageConversion',
      plan: 'uid-2',
      [planNameLabel]: 'plan-b',
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
});

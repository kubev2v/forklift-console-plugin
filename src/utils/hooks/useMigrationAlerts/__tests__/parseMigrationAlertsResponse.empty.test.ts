import type { PrometheusRulesResponse } from '@openshift-console/dynamic-plugin-sdk';

import { parseMigrationAlertsResponse } from '../parseMigrationAlertsResponse';

import { STATUS_SUCCESS } from './parseMigrationAlertsResponse.fixtures';

describe('parseMigrationAlertsResponse - empty responses', () => {
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
});

import type { PrometheusResponse } from '@openshift-console/dynamic-plugin-sdk';

import { parseLiveThroughput } from '../useLiveMigrationThroughput';

const PLAN_NAME_LABEL = 'plan_name';

const metric = (planName?: string): Record<string, string> =>
  planName ? Object.fromEntries([[PLAN_NAME_LABEL, planName]]) : {};

const response = (result: unknown[]): PrometheusResponse =>
  ({ data: { result } }) as unknown as PrometheusResponse;

describe('parseLiveThroughput', () => {
  it('maps plan names to values', () => {
    const parsed = parseLiveThroughput(
      response([
        { metric: metric('plan-a'), value: [1700000000, '1048576'] },
        { metric: metric('plan-b'), value: [1700000000, '2048'] },
      ]),
    );

    expect(parsed).toEqual({ 'plan-a': 1048576, 'plan-b': 2048 });
  });

  it('ignores series without a plan name or with an invalid value', () => {
    const parsed = parseLiveThroughput(
      response([
        { metric: {}, value: [1700000000, '10'] },
        { metric: metric('plan-a'), value: [1700000000, 'not-a-number'] },
      ]),
    );

    expect(parsed).toEqual({});
  });

  it('handles an empty response', () => {
    expect(parseLiveThroughput(undefined)).toEqual({});
  });
});

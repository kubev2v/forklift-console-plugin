import type { PrometheusResponse } from '@openshift-console/dynamic-plugin-sdk';

import { parseLiveThroughput } from '../liveThroughput';

const PLAN_ID_LABEL = 'plan_id';

const metric = (planId?: string): Record<string, string> =>
  planId ? Object.fromEntries([[PLAN_ID_LABEL, planId]]) : {};

const response = (result: unknown[]): PrometheusResponse =>
  ({ data: { result } }) as unknown as PrometheusResponse;

describe('parseLiveThroughput', () => {
  it('maps plan UIDs to values', () => {
    const parsed = parseLiveThroughput(
      response([
        { metric: metric('plan-uid-a'), value: [1700000000, '1048576'] },
        { metric: metric('plan-uid-b'), value: [1700000000, '2048'] },
      ]),
    );

    expect(parsed.get('plan-uid-a')).toBe(1048576);
    expect(parsed.get('plan-uid-b')).toBe(2048);
    expect(parsed.size).toBe(2);
  });

  it('keeps a real zero sample', () => {
    const parsed = parseLiveThroughput(
      response([{ metric: metric('plan-uid-a'), value: [1700000000, '0'] }]),
    );

    expect(parsed.get('plan-uid-a')).toBe(0);
  });

  it('ignores series without a plan UID or with an invalid value', () => {
    const parsed = parseLiveThroughput(
      response([
        { metric: {}, value: [1700000000, '10'] },
        { metric: metric('plan-uid-a'), value: [1700000000, 'not-a-number'] },
        { metric: metric('plan-uid-a'), value: [1700000000, '-5'] },
      ]),
    );

    expect(parsed.size).toBe(0);
  });

  it('handles an empty response', () => {
    expect(parseLiveThroughput(undefined).size).toBe(0);
  });
});

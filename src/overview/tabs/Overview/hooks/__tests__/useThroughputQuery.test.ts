import type { PrometheusResponse } from '@openshift-console/dynamic-plugin-sdk';

import { parseThroughputResponse } from '../useThroughputQuery';

const SAMPLE_TIMESTAMP_SECONDS = 1700000000;
const SAMPLE_TIMESTAMP_OFFSET_SECONDS = 1700000060;
const MS_PER_SECOND = 1000;

const SAMPLE_PLAN_ID = 'abc-123';
const SAMPLE_PLAN_NAME = 'my-plan';
const SECONDARY_PLAN_ID = 'def-456';
const SECONDARY_PLAN_NAME = 'other-plan';
const FALLBACK_PLAN_ID = 'a1';
const FALLBACK_PLAN_NAME = 'plan';

const RESULT_TYPE_MATRIX = 'matrix' as const;
const STATUS_SUCCESS = 'success';

const createMetric = (planId: string, planName: string): Record<string, string> => ({
  // eslint-disable-next-line camelcase
  plan_id: planId,
  // eslint-disable-next-line camelcase
  plan_name: planName,
});

const createSuccessResponse = (
  result: PrometheusResponse['data']['result'],
): PrometheusResponse => ({
  data: { result, resultType: RESULT_TYPE_MATRIX },
  status: STATUS_SUCCESS,
});

const createSingleValueResponse = (
  planId: string,
  planName: string,
  valueString: string,
): PrometheusResponse =>
  createSuccessResponse([
    {
      metric: createMetric(planId, planName),
      values: [[SAMPLE_TIMESTAMP_SECONDS, valueString]],
    },
  ]);

describe('parseThroughputResponse', () => {
  test('returns empty array for undefined response', () => {
    expect(parseThroughputResponse(undefined)).toEqual([]);
  });

  test('returns empty array when response has no data', () => {
    const response = { data: undefined, status: STATUS_SUCCESS } as unknown as PrometheusResponse;
    expect(parseThroughputResponse(response)).toEqual([]);
  });

  test('returns empty array when result is empty', () => {
    const response = createSuccessResponse([]);
    expect(parseThroughputResponse(response)).toEqual([]);
  });

  test('parses valid response with multiple series', () => {
    const response = createSuccessResponse([
      {
        metric: createMetric(SAMPLE_PLAN_ID, SAMPLE_PLAN_NAME),
        values: [
          [SAMPLE_TIMESTAMP_SECONDS, '1024'],
          [SAMPLE_TIMESTAMP_OFFSET_SECONDS, '2048'],
        ],
      },
      {
        metric: createMetric(SECONDARY_PLAN_ID, SECONDARY_PLAN_NAME),
        values: [[SAMPLE_TIMESTAMP_SECONDS, '512']],
      },
    ]);

    const result = parseThroughputResponse(response);

    expect(result).toHaveLength(2);
    expect(result[0].planId).toBe(SAMPLE_PLAN_ID);
    expect(result[0].planName).toBe(SAMPLE_PLAN_NAME);
    expect(result[0].values).toHaveLength(2);
    expect(result[0].values[0]).toEqual({
      throughput: 1024,
      timestamp: SAMPLE_TIMESTAMP_SECONDS * MS_PER_SECOND,
    });
    expect(result[0].values[1]).toEqual({
      throughput: 2048,
      timestamp: SAMPLE_TIMESTAMP_OFFSET_SECONDS * MS_PER_SECOND,
    });
    expect(result[1].planId).toBe(SECONDARY_PLAN_ID);
    expect(result[1].values).toHaveLength(1);
  });

  test('defaults missing plan_id and plan_name to empty strings', () => {
    const response: PrometheusResponse = {
      data: {
        result: [{ metric: {}, values: [[SAMPLE_TIMESTAMP_SECONDS, '100']] }],
        resultType: RESULT_TYPE_MATRIX,
      },
      status: STATUS_SUCCESS,
    };

    const result = parseThroughputResponse(response);

    expect(result[0].planId).toBe('');
    expect(result[0].planName).toBe('');
  });

  test('converts Prometheus seconds timestamps to milliseconds', () => {
    const response = createSingleValueResponse(FALLBACK_PLAN_ID, FALLBACK_PLAN_NAME, '100');

    const result = parseThroughputResponse(response);
    expect(result[0].values[0].timestamp).toBe(SAMPLE_TIMESTAMP_SECONDS * MS_PER_SECOND);
  });

  test('handles NaN values by converting to 0', () => {
    const response = createSingleValueResponse(FALLBACK_PLAN_ID, FALLBACK_PLAN_NAME, 'NaN');

    const result = parseThroughputResponse(response);
    expect(result[0].values[0].throughput).toBe(0);
  });

  test('handles +Inf values by converting to 0', () => {
    const response = createSingleValueResponse(FALLBACK_PLAN_ID, FALLBACK_PLAN_NAME, '+Inf');

    const result = parseThroughputResponse(response);
    expect(result[0].values[0].throughput).toBe(0);
  });

  test('handles negative values by converting to 0', () => {
    const response = createSingleValueResponse(FALLBACK_PLAN_ID, FALLBACK_PLAN_NAME, '-500');

    const result = parseThroughputResponse(response);
    expect(result[0].values[0].throughput).toBe(0);
  });

  test('handles empty values array', () => {
    const response = createSuccessResponse([
      { metric: createMetric(FALLBACK_PLAN_ID, FALLBACK_PLAN_NAME) },
    ]);

    const result = parseThroughputResponse(response);
    expect(result[0].values).toEqual([]);
  });
});

import { useMemo } from 'react';

import {
  PrometheusEndpoint,
  type PrometheusResponse,
  usePrometheusPoll,
} from '@openshift-console/dynamic-plugin-sdk';

import {
  THROUGHPUT_TIME_RANGE_CONFIG,
  type ThroughputTimeRange,
} from '../utils/throughputTimeRanges';

export type ThroughputSeries = {
  planId: string;
  planName: string;
  values: { throughput: number; timestamp: number }[];
};

type UseThroughputQueryResult = {
  data: ThroughputSeries[];
  error: unknown;
  loaded: boolean;
};

const parseThroughputResponse = (response: PrometheusResponse | undefined): ThroughputSeries[] => {
  if (!response?.data?.result) {
    return [];
  }

  return response.data.result.map((result) => ({
    planId: result.metric?.plan_id ?? '',
    planName: result.metric?.plan_name ?? '',
    values: (result.values ?? []).map(([ts, val]) => ({
      throughput: parseFloat(val) || 0,
      timestamp: ts * 1000,
    })),
  }));
};

const POLL_DELAY_MS = 30000;

export const useThroughputQuery = (
  metricName: string,
  timeRange: ThroughputTimeRange,
): UseThroughputQueryResult => {
  const config = THROUGHPUT_TIME_RANGE_CONFIG[timeRange];

  const [response, loaded, error] = usePrometheusPoll({
    delay: POLL_DELAY_MS,
    endpoint: PrometheusEndpoint.QUERY_RANGE,
    query: metricName,
    samples: config.samples,
    timespan: config.timespan,
  });

  const data = useMemo(() => parseThroughputResponse(response), [response]);

  return { data, error, loaded };
};

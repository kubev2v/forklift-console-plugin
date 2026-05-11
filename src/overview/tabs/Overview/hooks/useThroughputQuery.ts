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

const parseValue = (val: string): number => {
  const parsed = parseFloat(val);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
};

export const parseThroughputResponse = (
  response: PrometheusResponse | undefined,
): ThroughputSeries[] => {
  if (!response?.data?.result) {
    return [];
  }

  return response.data.result.map((result) => ({
    planId: result.metric?.plan_id ?? '',
    planName: result.metric?.plan_name ?? '',
    values: (result.values ?? []).map(([ts, val]) => ({
      throughput: parseValue(val),
      timestamp: ts * 1000,
    })),
  }));
};

const POLL_DELAY_MS = 30_000;
const MS_PER_SECOND = 1000;

export const useThroughputQuery = (
  metricName: string,
  timeRange: ThroughputTimeRange,
): UseThroughputQueryResult => {
  const config = THROUGHPUT_TIME_RANGE_CONFIG[timeRange];
  const stepSeconds = Math.round(config.timespan / (config.samples * MS_PER_SECOND));
  const query = `max_over_time(${metricName}[${stepSeconds}s])`;

  const [response, loaded, error] = usePrometheusPoll({
    delay: POLL_DELAY_MS,
    endpoint: PrometheusEndpoint.QUERY_RANGE,
    query,
    samples: config.samples,
    timespan: config.timespan,
  });

  const data = useMemo(() => parseThroughputResponse(response), [response]);

  return { data, error, loaded };
};

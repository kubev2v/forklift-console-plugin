import { useMemo } from 'react';

import {
  PrometheusEndpoint,
  type PrometheusResponse,
  usePrometheusPoll,
} from '@openshift-console/dynamic-plugin-sdk';

const POLL_DELAY_MS = 30_000;
const QUERY = 'max_over_time(mtv_migration_storage_throughput[2m])';

type LiveThroughputByPlan = Record<string, number>;

export const parseLiveThroughput = (
  response: PrometheusResponse | undefined,
): LiveThroughputByPlan => {
  const result = response?.data?.result ?? [];
  const rates: LiveThroughputByPlan = {};

  for (const series of result) {
    const planName = series.metric?.plan_name;
    const value = parseFloat(series.value?.[1] ?? '');

    if (planName && Number.isFinite(value) && value >= 0) {
      rates[planName] = value;
    }
  }

  return rates;
};

export const useLiveMigrationThroughput = (): LiveThroughputByPlan => {
  const [response] = usePrometheusPoll({
    delay: POLL_DELAY_MS,
    endpoint: PrometheusEndpoint.QUERY,
    query: QUERY,
  });

  return useMemo(() => parseLiveThroughput(response), [response]);
};

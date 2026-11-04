import type { PrometheusResponse } from '@openshift-console/dynamic-plugin-sdk';

export const LIVE_THROUGHPUT_QUERY = 'mtv_migration_storage_throughput';

const PLAN_ID_LABEL = 'plan_id';

export type LiveThroughputByPlan = Map<string, number>;

export const parseLiveThroughput = (
  response: PrometheusResponse | undefined,
): LiveThroughputByPlan => {
  const rates: LiveThroughputByPlan = new Map();

  for (const series of response?.data?.result ?? []) {
    const planId = series.metric?.[PLAN_ID_LABEL];
    const value = parseFloat(series.value?.[1] ?? '');

    if (planId && Number.isFinite(value) && value >= 0) {
      rates.set(planId, value);
    }
  }

  return rates;
};

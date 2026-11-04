import { useMemo } from 'react';

import { PrometheusEndpoint, usePrometheusPoll } from '@openshift-console/dynamic-plugin-sdk';

import {
  LIVE_THROUGHPUT_QUERY,
  type LiveThroughputByPlan,
  parseLiveThroughput,
} from '../utils/liveThroughput';

const POLL_DELAY_MS = 30_000;

export const useLiveMigrationThroughput = (): LiveThroughputByPlan => {
  const [response] = usePrometheusPoll({
    delay: POLL_DELAY_MS,
    endpoint: PrometheusEndpoint.QUERY,
    query: LIVE_THROUGHPUT_QUERY,
  });

  return useMemo(() => parseLiveThroughput(response), [response]);
};

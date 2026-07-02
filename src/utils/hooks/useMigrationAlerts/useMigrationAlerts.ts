import { useMemo } from 'react';

import {
  PrometheusEndpoint,
  type PrometheusRulesResponse,
  usePrometheusPoll,
} from '@openshift-console/dynamic-plugin-sdk';

import { parseMigrationAlertsResponse } from './parseMigrationAlertsResponse';
import type { UseMigrationAlertsResult } from './types';

const POLL_DELAY_MS = 30_000;

const useMigrationAlerts = (): UseMigrationAlertsResult => {
  const [response, loaded, error] = usePrometheusPoll({
    delay: POLL_DELAY_MS,
    endpoint: PrometheusEndpoint.RULES,
  });

  const alerts = useMemo(
    () => parseMigrationAlertsResponse(response as PrometheusRulesResponse | undefined),
    [response],
  );

  return { alerts, error, loaded };
};

export default useMigrationAlerts;

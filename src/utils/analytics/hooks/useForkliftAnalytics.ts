import { useEffect, useRef } from 'react';

import { initializeAnalytics } from '../initializeAnalytics';
import { sendAnalyticsEvent } from '../sendAnalyticsEvent';

import { useAnalyticsConfig } from './useAnalyticsConfig';

/**
 * React hook for forklift telemetry with ConfigMap configuration
 */
export const useForkliftAnalytics = () => {
  const { clusterId, segmentKey } = useAnalyticsConfig();
  const initializationAttempted = useRef(false);
  const isTelemetryDisabled = window.SERVER_FLAGS?.telemetry?.TELEMETRY_DISABLED === 'true';

  useEffect(() => {
    if (
      segmentKey &&
      !initializationAttempted.current &&
      !window.analytics?.track &&
      !isTelemetryDisabled
    ) {
      initializationAttempted.current = true;
      initializeAnalytics(segmentKey);
    }
  }, [segmentKey, isTelemetryDisabled]);

  const trackEvent = (eventType: string, properties: Record<string, unknown> = {}) => {
    if (!segmentKey || !clusterId || isTelemetryDisabled || !window.analytics?.track) {
      return;
    }

    sendAnalyticsEvent(`MTV: ${eventType}`, properties, { clusterId, segmentKey });
  };

  return { trackEvent };
};

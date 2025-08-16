import { SEGMENT_METHODS, SEGMENT_SNIPPET_VERSION } from './constants';

/**
 * Initialize Segment analytics using official snippet v5.2.0
 */
export const initializeAnalytics = (segmentKey: string) => {
  if (window.analytics && typeof window.analytics.track === 'function') {
    return;
  }

  const analyticsKey = 'analytics';
  window[analyticsKey] ??= [] as unknown as SegmentAnalytics;
  const analytics = window[analyticsKey];

  if (!analytics.initialize) {
    if (analytics.invoked) {
      if (window.console?.error) {
        window.console.error('Segment snippet included twice.');
      }
    } else {
      analytics.invoked = true;
      analytics.methods = [...SEGMENT_METHODS];

      analytics.factory = function factory(method: string) {
        return function analyticsMethodWrapper(...args: unknown[]) {
          if (window.analytics?.initialized) {
            const analyticsMethod = window.analytics[method as keyof SegmentAnalytics];

            if (typeof analyticsMethod === 'function') {
              return (analyticsMethod as (...args: unknown[]) => SegmentAnalytics).call(
                window.analytics,
                ...args,
              );
            }

            return window.analytics;
          }

          const argsArray = Array.prototype.slice.call(args);

          if (['track', 'screen', 'alias', 'group', 'page', 'identify'].includes(method)) {
            const canonical = document.querySelector("link[rel='canonical']");

            argsArray.push({
              __t: 'bpc',
              canonical: canonical?.getAttribute('href') ?? undefined,
              pathname: location.pathname,
              referrer: document.referrer,
              search: location.search,
              title: document.title,
              url: location.href,
            });
          }
          argsArray.unshift(method);
          analytics.push(argsArray);

          return analytics;
        };
      };

      for (const key of analytics.methods) {
        analytics[key] = analytics.factory(key);
      }

      analytics.load = function load(key: string, options?: Record<string, unknown>) {
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.async = true;
        script.setAttribute('data-global-segment-analytics-key', analyticsKey);
        // Use configurable Segment JS URL for CSP compliance
        const jsUrl =
          window.SERVER_FLAGS?.telemetry?.SEGMENT_JS_URL ||
          `https://cdn.segment.com/analytics.js/v1/${encodeURIComponent(key)}/analytics.min.js`;
        script.src = jsUrl;

        const first = document.getElementsByTagName('script')[0];
        first?.parentNode?.insertBefore(script, first);
        analytics._loadOptions = options;
      };

      analytics._writeKey = segmentKey;
      analytics.SNIPPET_VERSION = SEGMENT_SNIPPET_VERSION;
      analytics.load(segmentKey);
      analytics.page();
    }
  }
};

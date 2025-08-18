import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { renderHook } from '@testing-library/react-hooks';

import { ConsoleConfigMap } from '../../constants';
import { initializeAnalytics } from '../../initializeAnalytics';
import { sendAnalyticsEvent } from '../../sendAnalyticsEvent';
import { useForkliftAnalytics } from '../useForkliftAnalytics';

jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  getGroupVersionKindForModel: jest.fn(() => ({ group: '', version: 'v1', kind: 'ConfigMap' })),
  useK8sWatchResource: jest.fn(),
}));

jest.mock('../../initializeAnalytics');
jest.mock('../../sendAnalyticsEvent');

const mockUseK8sWatchResource = useK8sWatchResource as jest.MockedFunction<
  typeof useK8sWatchResource
>;
const mockInitializeAnalytics = initializeAnalytics as jest.MockedFunction<
  typeof initializeAnalytics
>;
const mockSendAnalyticsEvent = sendAnalyticsEvent as jest.MockedFunction<typeof sendAnalyticsEvent>;

describe('useForkliftAnalytics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    delete (window as any).analytics;
    delete (window as any).SERVER_FLAGS;
    (mockUseK8sWatchResource as any).mockReturnValue([
      {
        data: {
          [ConsoleConfigMap.ConfigKey]: `
            SEGMENT_PUBLIC_API_KEY: test-segment-key
            CLUSTER_ID: test-cluster-id
          `,
        },
      },
      true,
    ]);
  });

  afterEach(() => {
    delete (window as any).analytics;
    delete (window as any).SERVER_FLAGS;
  });

  it('initializes analytics with segment key', () => {
    renderHook(() => useForkliftAnalytics());

    expect(mockInitializeAnalytics).toHaveBeenCalledWith('test-segment-key');
  });

  it('prevents duplicate initialization', () => {
    const { rerender } = renderHook(() => useForkliftAnalytics());
    rerender();

    expect(mockInitializeAnalytics).toHaveBeenCalledTimes(1);
  });

  it('does not initialize when segment key is missing', () => {
    (mockUseK8sWatchResource as any).mockReturnValue([
      { data: { [ConsoleConfigMap.ConfigKey]: 'CLUSTER_ID: test-cluster' } },
      true,
    ]);

    renderHook(() => useForkliftAnalytics());

    expect(mockInitializeAnalytics).not.toHaveBeenCalled();
  });

  it('skips initialization when analytics already exists', () => {
    (window as any).analytics = { track: jest.fn() };

    renderHook(() => useForkliftAnalytics());

    expect(mockInitializeAnalytics).not.toHaveBeenCalled();
  });

  it('does not initialize when telemetry is disabled', () => {
    (window as any).SERVER_FLAGS = {
      telemetry: { TELEMETRY_DISABLED: 'true' },
    };

    renderHook(() => useForkliftAnalytics());

    expect(mockInitializeAnalytics).not.toHaveBeenCalled();
  });

  it('initializes when telemetry disabled flag is not true', () => {
    (window as any).SERVER_FLAGS = {
      telemetry: { TELEMETRY_DISABLED: 'false' },
    };

    renderHook(() => useForkliftAnalytics());

    expect(mockInitializeAnalytics).toHaveBeenCalledWith('test-segment-key');
  });

  it('returns trackEvent function', () => {
    const { result } = renderHook(() => useForkliftAnalytics());

    expect(typeof result.current.trackEvent).toBe('function');
  });

  describe('trackEvent', () => {
    beforeEach(() => {
      (window as any).analytics = { track: jest.fn() };
    });

    it('sends analytics event with properties', () => {
      const { result } = renderHook(() => useForkliftAnalytics());
      const properties = { planId: 'test-plan' };

      result.current.trackEvent('test_event', properties);

      expect(mockSendAnalyticsEvent).toHaveBeenCalledWith('test_event', properties, {
        clusterId: 'test-cluster-id',
        segmentKey: 'test-segment-key',
      });
    });

    it('sends analytics event with empty properties by default', () => {
      const { result } = renderHook(() => useForkliftAnalytics());

      result.current.trackEvent('test_event');

      expect(mockSendAnalyticsEvent).toHaveBeenCalledWith(
        'test_event',
        {},
        {
          clusterId: 'test-cluster-id',
          segmentKey: 'test-segment-key',
        },
      );
    });

    it('does not send event when segment key is missing', () => {
      (mockUseK8sWatchResource as any).mockReturnValue([
        { data: { [ConsoleConfigMap.ConfigKey]: 'CLUSTER_ID: test-cluster' } },
        true,
      ]);

      const { result } = renderHook(() => useForkliftAnalytics());

      result.current.trackEvent('test_event');

      expect(mockSendAnalyticsEvent).not.toHaveBeenCalled();
    });

    it('does not send event when cluster ID is missing', () => {
      (mockUseK8sWatchResource as any).mockReturnValue([
        { data: { [ConsoleConfigMap.ConfigKey]: 'SEGMENT_PUBLIC_API_KEY: test-key' } },
        true,
      ]);

      const { result } = renderHook(() => useForkliftAnalytics());

      result.current.trackEvent('test_event');

      expect(mockSendAnalyticsEvent).not.toHaveBeenCalled();
    });

    it('does not send event when analytics is not available', () => {
      delete (window as any).analytics;

      const { result } = renderHook(() => useForkliftAnalytics());

      result.current.trackEvent('test_event');

      expect(mockSendAnalyticsEvent).not.toHaveBeenCalled();
    });

    it('does not send event when analytics.track is not available', () => {
      (window as any).analytics = {};

      const { result } = renderHook(() => useForkliftAnalytics());

      result.current.trackEvent('test_event');

      expect(mockSendAnalyticsEvent).not.toHaveBeenCalled();
    });

    it('does not send event when telemetry is disabled', () => {
      (window as any).SERVER_FLAGS = {
        telemetry: { TELEMETRY_DISABLED: 'true' },
      };

      const { result } = renderHook(() => useForkliftAnalytics());

      result.current.trackEvent('test_event');

      expect(mockSendAnalyticsEvent).not.toHaveBeenCalled();
    });

    it('sends event when telemetry disabled flag is not true', () => {
      (window as any).SERVER_FLAGS = {
        telemetry: { TELEMETRY_DISABLED: 'false' },
      };

      const { result } = renderHook(() => useForkliftAnalytics());

      result.current.trackEvent('test_event');

      expect(mockSendAnalyticsEvent).toHaveBeenCalledWith(
        'test_event',
        {},
        {
          clusterId: 'test-cluster-id',
          segmentKey: 'test-segment-key',
        },
      );
    });
  });
});

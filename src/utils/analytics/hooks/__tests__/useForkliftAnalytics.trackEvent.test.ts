import { renderHook } from '@testing-library/react';

import './useForkliftAnalytics.fixtures';

import { ConsoleConfigMap } from '../../constants';
import { useForkliftAnalytics } from '../useForkliftAnalytics';

import {
  mockSendAnalyticsEvent,
  mockUseK8sWatchResource,
  setupForkliftAnalyticsTest,
  teardownForkliftAnalyticsTest,
} from './useForkliftAnalytics.fixtures';

describe('useForkliftAnalytics - trackEvent', () => {
  beforeEach(() => {
    setupForkliftAnalyticsTest();
    (window as unknown as { analytics: { track: jest.Mock } }).analytics = { track: jest.fn() };
  });

  afterEach(() => {
    teardownForkliftAnalyticsTest();
  });

  it('sends analytics event with properties', () => {
    const { result } = renderHook(() => useForkliftAnalytics());
    const properties = { planId: 'test-plan' };

    result.current.trackEvent('test_event', properties);

    expect(mockSendAnalyticsEvent).toHaveBeenCalledWith('MTV: test_event', properties, {
      clusterId: 'test-cluster-id',
      segmentKey: 'test-segment-key',
    });
  });

  it('sends analytics event with empty properties by default', () => {
    const { result } = renderHook(() => useForkliftAnalytics());

    result.current.trackEvent('test_event');

    expect(mockSendAnalyticsEvent).toHaveBeenCalledWith(
      'MTV: test_event',
      {},
      {
        clusterId: 'test-cluster-id',
        segmentKey: 'test-segment-key',
      },
    );
  });

  it('does not send event when segment key is missing', () => {
    (mockUseK8sWatchResource as jest.Mock).mockReturnValue([
      { data: { [ConsoleConfigMap.ConfigKey]: 'CLUSTER_ID: test-cluster' } },
      true,
    ]);

    const { result } = renderHook(() => useForkliftAnalytics());

    result.current.trackEvent('test_event');

    expect(mockSendAnalyticsEvent).not.toHaveBeenCalled();
  });

  it('does not send event when cluster ID is missing', () => {
    (mockUseK8sWatchResource as jest.Mock).mockReturnValue([
      { data: { [ConsoleConfigMap.ConfigKey]: 'SEGMENT_PUBLIC_API_KEY: test-key' } },
      true,
    ]);

    const { result } = renderHook(() => useForkliftAnalytics());

    result.current.trackEvent('test_event');

    expect(mockSendAnalyticsEvent).not.toHaveBeenCalled();
  });

  it('does not send event when analytics is not available', () => {
    delete (window as unknown as { analytics?: unknown }).analytics;

    const { result } = renderHook(() => useForkliftAnalytics());

    result.current.trackEvent('test_event');

    expect(mockSendAnalyticsEvent).not.toHaveBeenCalled();
  });

  it('does not send event when analytics.track is not available', () => {
    (window as unknown as { analytics: Record<string, never> }).analytics = {};

    const { result } = renderHook(() => useForkliftAnalytics());

    result.current.trackEvent('test_event');

    expect(mockSendAnalyticsEvent).not.toHaveBeenCalled();
  });

  it('does not send event when telemetry is disabled', () => {
    (
      window as unknown as { SERVER_FLAGS: { telemetry: { TELEMETRY_DISABLED: string } } }
    ).SERVER_FLAGS = {
      telemetry: { TELEMETRY_DISABLED: 'true' },
    };

    const { result } = renderHook(() => useForkliftAnalytics());

    result.current.trackEvent('test_event');

    expect(mockSendAnalyticsEvent).not.toHaveBeenCalled();
  });

  it('sends event when telemetry disabled flag is not true', () => {
    (
      window as unknown as { SERVER_FLAGS: { telemetry: { TELEMETRY_DISABLED: string } } }
    ).SERVER_FLAGS = {
      telemetry: { TELEMETRY_DISABLED: 'false' },
    };

    const { result } = renderHook(() => useForkliftAnalytics());

    result.current.trackEvent('test_event');

    expect(mockSendAnalyticsEvent).toHaveBeenCalledWith(
      'MTV: test_event',
      {},
      {
        clusterId: 'test-cluster-id',
        segmentKey: 'test-segment-key',
      },
    );
  });
});

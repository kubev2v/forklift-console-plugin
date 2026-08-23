import { renderHook } from '@testing-library/react';

import './useForkliftAnalytics.fixtures';

import { ConsoleConfigMap } from '../../constants';
import { useForkliftAnalytics } from '../useForkliftAnalytics';

import {
  mockInitializeAnalytics,
  mockUseK8sWatchResource,
  setupForkliftAnalyticsTest,
  teardownForkliftAnalyticsTest,
} from './useForkliftAnalytics.fixtures';

describe('useForkliftAnalytics - initialization', () => {
  beforeEach(() => {
    setupForkliftAnalyticsTest();
  });

  afterEach(() => {
    teardownForkliftAnalyticsTest();
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
    (mockUseK8sWatchResource as jest.Mock).mockReturnValue([
      { data: { [ConsoleConfigMap.ConfigKey]: 'CLUSTER_ID: test-cluster' } },
      true,
    ]);

    renderHook(() => useForkliftAnalytics());

    expect(mockInitializeAnalytics).not.toHaveBeenCalled();
  });

  it('skips initialization when analytics already exists', () => {
    (window as unknown as { analytics: { track: jest.Mock } }).analytics = { track: jest.fn() };

    renderHook(() => useForkliftAnalytics());

    expect(mockInitializeAnalytics).not.toHaveBeenCalled();
  });

  it('does not initialize when telemetry is disabled', () => {
    (
      window as unknown as { SERVER_FLAGS: { telemetry: { TELEMETRY_DISABLED: string } } }
    ).SERVER_FLAGS = {
      telemetry: { TELEMETRY_DISABLED: 'true' },
    };

    renderHook(() => useForkliftAnalytics());

    expect(mockInitializeAnalytics).not.toHaveBeenCalled();
  });

  it('initializes when telemetry disabled flag is not true', () => {
    (
      window as unknown as { SERVER_FLAGS: { telemetry: { TELEMETRY_DISABLED: string } } }
    ).SERVER_FLAGS = {
      telemetry: { TELEMETRY_DISABLED: 'false' },
    };

    renderHook(() => useForkliftAnalytics());

    expect(mockInitializeAnalytics).toHaveBeenCalledWith('test-segment-key');
  });

  it('returns trackEvent function', () => {
    const { result } = renderHook(() => useForkliftAnalytics());

    expect(typeof result.current.trackEvent).toBe('function');
  });
});

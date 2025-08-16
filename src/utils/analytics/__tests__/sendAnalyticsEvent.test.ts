import { initializeAnalytics } from '../initializeAnalytics';
import { sendAnalyticsEvent } from '../sendAnalyticsEvent';
import type { AnalyticsConfig } from '../types';

jest.mock('../initializeAnalytics');

const mockInitializeAnalytics = initializeAnalytics as jest.MockedFunction<
  typeof initializeAnalytics
>;

describe('sendAnalyticsEvent', () => {
  const mockAnalyticsConfig: AnalyticsConfig = {
    clusterId: 'test-cluster-id',
    segmentKey: 'test-segment-key',
  };

  const mockTrack = jest.fn();
  const originalConsoleLog = console.log;
  const originalConsoleWarn = console.warn;
  const mockConsoleLog = jest.fn();
  const mockConsoleWarn = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    delete (window as any).analytics;
    delete process.env.NODE_ENV;
    delete process.env.VERSION;

    console.log = mockConsoleLog;
    console.warn = mockConsoleWarn;

    Object.defineProperty(navigator, 'userAgent', {
      writable: true,
      value: 'test-user-agent',
    });
  });

  afterEach(() => {
    delete (window as any).analytics;
    console.log = originalConsoleLog;
    console.warn = originalConsoleWarn;
  });

  it('initializes analytics with segment key', () => {
    (window as any).analytics = { track: mockTrack };

    sendAnalyticsEvent('test_event', {}, mockAnalyticsConfig);

    expect(mockInitializeAnalytics).toHaveBeenCalledWith('test-segment-key');
  });

  it('sends analytics event with properties and config data', () => {
    (window as any).analytics = { track: mockTrack };
    process.env.VERSION = '1.2.3';

    const properties = { planId: 'test-plan', action: 'create' };
    const expectedTimestamp = Date.now();

    jest.spyOn(Date, 'now').mockReturnValue(expectedTimestamp);

    sendAnalyticsEvent('plan_created', properties, mockAnalyticsConfig);

    expect(mockTrack).toHaveBeenCalledWith(
      'plan_created',
      {
        clusterId: 'test-cluster-id',
        plugin: 'forklift-console-plugin',
        timestamp: expectedTimestamp,
        userAgent: 'test-user-agent',
        version: '1.2.3',
        planId: 'test-plan',
        action: 'create',
      },
      {
        context: {
          ip: '0.0.0.0',
        },
      },
    );
  });

  it('uses "unknown" version when VERSION env is not set', () => {
    (window as any).analytics = { track: mockTrack };
    delete process.env.VERSION;

    sendAnalyticsEvent('test_event', {}, mockAnalyticsConfig);

    expect(mockTrack).toHaveBeenCalledWith(
      'test_event',
      expect.objectContaining({
        version: 'unknown',
      }),
      expect.any(Object),
    );
  });

  it('does not call analytics.track when analytics is not available', () => {
    delete (window as any).analytics;

    sendAnalyticsEvent('test_event', {}, mockAnalyticsConfig);

    expect(mockTrack).not.toHaveBeenCalled();
    expect(mockConsoleLog).not.toHaveBeenCalled();
    expect(mockConsoleWarn).not.toHaveBeenCalled();
  });

  it('returns early when analytics is null', () => {
    (window as any).analytics = null;

    sendAnalyticsEvent('test_event', {}, mockAnalyticsConfig);

    expect(mockInitializeAnalytics).toHaveBeenCalled();
    expect(mockTrack).not.toHaveBeenCalled();
  });

  it('logs debug information in development mode', () => {
    process.env.NODE_ENV = 'development';
    (window as any).analytics = { track: mockTrack };

    const properties = { planId: 'test-plan' };

    sendAnalyticsEvent('test_event', properties, mockAnalyticsConfig);

    expect(mockConsoleLog).toHaveBeenCalledWith('[Forklift Analytics] Tracking event: test_event', {
      clusterId: 'test-cluster-id',
      eventData: expect.objectContaining({
        clusterId: 'test-cluster-id',
        plugin: 'forklift-console-plugin',
        planId: 'test-plan',
      }),
    });
  });

  it('does not log debug information in production mode', () => {
    process.env.NODE_ENV = 'production';
    (window as any).analytics = { track: mockTrack };

    sendAnalyticsEvent('test_event', {}, mockAnalyticsConfig);

    expect(mockConsoleLog).not.toHaveBeenCalled();
  });

  it('does not log debug information when NODE_ENV is undefined', () => {
    delete process.env.NODE_ENV;
    (window as any).analytics = { track: mockTrack };

    sendAnalyticsEvent('test_event', {}, mockAnalyticsConfig);

    expect(mockConsoleLog).not.toHaveBeenCalled();
  });

  it('handles errors during analytics.track call', () => {
    const error = new Error('Analytics error');
    mockTrack.mockImplementation(() => {
      throw error;
    });
    (window as any).analytics = { track: mockTrack };

    sendAnalyticsEvent('test_event', {}, mockAnalyticsConfig);

    expect(mockConsoleWarn).toHaveBeenCalledWith(
      '[Forklift Analytics] Failed to track test_event:',
      error,
    );
  });

  it('spreads custom properties into event data', () => {
    (window as any).analytics = { track: mockTrack };

    const customProperties = {
      planName: 'migration-plan-1',
      sourceProvider: 'vmware',
      targetProvider: 'openshift',
    };

    sendAnalyticsEvent('migration_started', customProperties, mockAnalyticsConfig);

    expect(mockTrack).toHaveBeenCalledWith(
      'migration_started',
      expect.objectContaining(customProperties),
      expect.any(Object),
    );
  });

  it('preserves all required context properties', () => {
    (window as any).analytics = { track: mockTrack };

    sendAnalyticsEvent('test_event', {}, mockAnalyticsConfig);

    expect(mockTrack).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        clusterId: 'test-cluster-id',
        plugin: 'forklift-console-plugin',
        timestamp: expect.any(Number),
        userAgent: expect.any(String),
        version: expect.any(String),
      }),
      {
        context: {
          ip: '0.0.0.0',
        },
      },
    );
  });

  it('handles empty properties object', () => {
    (window as any).analytics = { track: mockTrack };

    sendAnalyticsEvent('test_event', {}, mockAnalyticsConfig);

    expect(mockTrack).toHaveBeenCalledWith(
      'test_event',
      expect.objectContaining({
        clusterId: 'test-cluster-id',
        plugin: 'forklift-console-plugin',
      }),
      expect.any(Object),
    );
  });

  it('merges properties without overriding built-in properties', () => {
    (window as any).analytics = { track: mockTrack };

    // Try to override built-in properties
    const maliciousProperties = {
      clusterId: 'malicious-cluster',
      plugin: 'malicious-plugin',
      timestamp: 123456789,
    };

    sendAnalyticsEvent('test_event', maliciousProperties, mockAnalyticsConfig);

    expect(mockTrack).toHaveBeenCalledWith(
      'test_event',
      expect.objectContaining({
        clusterId: 'test-cluster-id',
        plugin: 'forklift-console-plugin',
        timestamp: expect.any(Number),
      }),
      expect.any(Object),
    );
  });
});

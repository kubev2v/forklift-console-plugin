import './sendAnalyticsEvent.fixtures';

import { sendAnalyticsEvent } from '../sendAnalyticsEvent';

import {
  mockAnalyticsConfig,
  mockConsoleLog,
  mockConsoleWarn,
  mockInitializeAnalytics,
  mockTrack,
  setupAnalyticsTest,
  teardownAnalyticsTest,
} from './sendAnalyticsEvent.fixtures';

describe('sendAnalyticsEvent - tracking', () => {
  beforeEach(() => {
    setupAnalyticsTest();
  });

  afterEach(() => {
    teardownAnalyticsTest();
  });

  it('initializes analytics with segment key', () => {
    (window as unknown as { analytics: { track: jest.Mock } }).analytics = { track: mockTrack };

    sendAnalyticsEvent('test_event', {}, mockAnalyticsConfig);

    expect(mockInitializeAnalytics).toHaveBeenCalledWith('test-segment-key');
  });

  it('sends analytics event with properties and config data', () => {
    (window as unknown as { analytics: { track: jest.Mock } }).analytics = { track: mockTrack };
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
    (window as unknown as { analytics: { track: jest.Mock } }).analytics = { track: mockTrack };
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
    sendAnalyticsEvent('test_event', {}, mockAnalyticsConfig);

    expect(mockTrack).not.toHaveBeenCalled();
    expect(mockConsoleLog).not.toHaveBeenCalled();
    expect(mockConsoleWarn).not.toHaveBeenCalled();
  });

  it('returns early when analytics is null', () => {
    (window as unknown as { analytics: null }).analytics = null;

    sendAnalyticsEvent('test_event', {}, mockAnalyticsConfig);

    expect(mockInitializeAnalytics).toHaveBeenCalled();
    expect(mockTrack).not.toHaveBeenCalled();
  });

  it('spreads custom properties into event data', () => {
    (window as unknown as { analytics: { track: jest.Mock } }).analytics = { track: mockTrack };

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
    (window as unknown as { analytics: { track: jest.Mock } }).analytics = { track: mockTrack };

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
    (window as unknown as { analytics: { track: jest.Mock } }).analytics = { track: mockTrack };

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
    (window as unknown as { analytics: { track: jest.Mock } }).analytics = { track: mockTrack };

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

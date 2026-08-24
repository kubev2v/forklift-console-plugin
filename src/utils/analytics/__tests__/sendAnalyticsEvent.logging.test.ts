import './sendAnalyticsEvent.fixtures';

import { sendAnalyticsEvent } from '../sendAnalyticsEvent';

import {
  mockAnalyticsConfig,
  mockConsoleLog,
  mockConsoleWarn,
  mockTrack,
  setupAnalyticsTest,
  teardownAnalyticsTest,
} from './sendAnalyticsEvent.fixtures';

describe('sendAnalyticsEvent - logging and errors', () => {
  beforeEach(() => {
    setupAnalyticsTest();
  });

  afterEach(() => {
    teardownAnalyticsTest();
  });

  it('logs debug information in development mode', () => {
    process.env.NODE_ENV = 'development';
    (window as unknown as { analytics: { track: jest.Mock } }).analytics = { track: mockTrack };

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
    (window as unknown as { analytics: { track: jest.Mock } }).analytics = { track: mockTrack };

    sendAnalyticsEvent('test_event', {}, mockAnalyticsConfig);

    expect(mockConsoleLog).not.toHaveBeenCalled();
  });

  it('does not log debug information when NODE_ENV is undefined', () => {
    delete process.env.NODE_ENV;
    (window as unknown as { analytics: { track: jest.Mock } }).analytics = { track: mockTrack };

    sendAnalyticsEvent('test_event', {}, mockAnalyticsConfig);

    expect(mockConsoleLog).not.toHaveBeenCalled();
  });

  it('handles errors during analytics.track call', () => {
    process.env.NODE_ENV = 'development';
    const error = new Error('Analytics error');
    mockTrack.mockImplementation(() => {
      throw error;
    });
    (window as unknown as { analytics: { track: jest.Mock } }).analytics = { track: mockTrack };

    sendAnalyticsEvent('test_event', {}, mockAnalyticsConfig);

    expect(mockConsoleWarn).toHaveBeenCalledWith(
      '[Forklift Analytics] Failed to track test_event:',
      error,
    );
  });
});

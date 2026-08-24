import { initializeAnalytics } from '../initializeAnalytics';
import type { AnalyticsConfig } from '../types';

jest.mock('../initializeAnalytics');

export const mockAnalyticsConfig: AnalyticsConfig = {
  clusterId: 'test-cluster-id',
  segmentKey: 'test-segment-key',
};

export const mockTrack = jest.fn();
export const mockConsoleLog = jest.fn();
export const mockConsoleWarn = jest.fn();

export const mockInitializeAnalytics = initializeAnalytics as jest.MockedFunction<
  typeof initializeAnalytics
>;

export const setupAnalyticsTest = (): void => {
  jest.clearAllMocks();
  delete (window as unknown as { analytics?: unknown }).analytics;
  delete process.env.NODE_ENV;
  delete process.env.VERSION;

  console.log = mockConsoleLog;
  console.warn = mockConsoleWarn;

  Object.defineProperty(navigator, 'userAgent', {
    writable: true,
    value: 'test-user-agent',
  });
};

export const teardownAnalyticsTest = (): void => {
  delete (window as unknown as { analytics?: unknown }).analytics;
};

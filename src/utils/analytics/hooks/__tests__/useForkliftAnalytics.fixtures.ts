import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

import { ConsoleConfigMap } from '../../constants';
import { initializeAnalytics } from '../../initializeAnalytics';
import { sendAnalyticsEvent } from '../../sendAnalyticsEvent';

jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  getGroupVersionKindForModel: jest.fn(() => ({ group: '', version: 'v1', kind: 'ConfigMap' })),
  useK8sWatchResource: jest.fn(),
}));

jest.mock('../../initializeAnalytics');
jest.mock('../../sendAnalyticsEvent');

export const mockUseK8sWatchResource = useK8sWatchResource as jest.MockedFunction<
  typeof useK8sWatchResource
>;
export const mockInitializeAnalytics = initializeAnalytics as jest.MockedFunction<
  typeof initializeAnalytics
>;
export const mockSendAnalyticsEvent = sendAnalyticsEvent as jest.MockedFunction<
  typeof sendAnalyticsEvent
>;

const defaultConfigMapData = {
  data: {
    [ConsoleConfigMap.ConfigKey]: `
            SEGMENT_PUBLIC_API_KEY: test-segment-key
            CLUSTER_ID: test-cluster-id
          `,
  },
};

export const setupForkliftAnalyticsTest = (): void => {
  jest.clearAllMocks();
  delete (window as unknown as { analytics?: unknown }).analytics;
  delete (window as unknown as { SERVER_FLAGS?: unknown }).SERVER_FLAGS;
  (mockUseK8sWatchResource as jest.Mock).mockReturnValue([defaultConfigMapData, true]);
};

export const teardownForkliftAnalyticsTest = (): void => {
  delete (window as unknown as { analytics?: unknown }).analytics;
  delete (window as unknown as { SERVER_FLAGS?: unknown }).SERVER_FLAGS;
};

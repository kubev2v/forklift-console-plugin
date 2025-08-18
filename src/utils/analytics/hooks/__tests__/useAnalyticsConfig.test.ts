import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { renderHook } from '@testing-library/react-hooks';

import { ConsoleConfigMap } from '../../constants';
import { useAnalyticsConfig } from '../useAnalyticsConfig';

jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  getGroupVersionKindForModel: jest.fn(() => ({ group: '', version: 'v1', kind: 'ConfigMap' })),
  useK8sWatchResource: jest.fn(),
}));

const mockUseK8sWatchResource = useK8sWatchResource as jest.MockedFunction<
  typeof useK8sWatchResource
>;

describe('useAnalyticsConfig', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.NODE_ENV;
  });

  it('returns empty config when not loaded', () => {
    (mockUseK8sWatchResource as any).mockReturnValue([undefined, false]);

    const { result } = renderHook(() => useAnalyticsConfig());

    expect(result.current).toEqual({ clusterId: '', segmentKey: '' });
  });

  it('returns empty config when yaml content is missing', () => {
    (mockUseK8sWatchResource as any).mockReturnValue([{ data: {} }, true]);

    const { result } = renderHook(() => useAnalyticsConfig());

    expect(result.current).toEqual({ clusterId: '', segmentKey: '' });
  });

  it('extracts production segment key and cluster ID from yaml', () => {
    const yamlContent = `
      SEGMENT_PUBLIC_API_KEY: prod-segment-key
      CLUSTER_ID: test-cluster-123
    `;

    (mockUseK8sWatchResource as any).mockReturnValue([
      { data: { [ConsoleConfigMap.ConfigKey]: yamlContent } },
      true,
    ]);

    const { result } = renderHook(() => useAnalyticsConfig());

    expect(result.current).toEqual({
      clusterId: 'test-cluster-123',
      segmentKey: 'prod-segment-key',
    });
  });

  it('extracts development segment key when NODE_ENV is development', () => {
    process.env.NODE_ENV = 'development';

    const yamlContent = `
      DEV_SEGMENT_API_KEY: dev-segment-key
      SEGMENT_PUBLIC_API_KEY: prod-segment-key
      CLUSTER_ID: test-cluster-123
    `;

    (mockUseK8sWatchResource as any).mockReturnValue([
      { data: { [ConsoleConfigMap.ConfigKey]: yamlContent } },
      true,
    ]);

    const { result } = renderHook(() => useAnalyticsConfig());

    expect(result.current).toEqual({
      clusterId: 'test-cluster-123',
      segmentKey: 'dev-segment-key',
    });
  });

  it('handles missing values gracefully', () => {
    const yamlContent = 'some: other-config';

    (mockUseK8sWatchResource as any).mockReturnValue([
      { data: { [ConsoleConfigMap.ConfigKey]: yamlContent } },
      true,
    ]);

    const { result } = renderHook(() => useAnalyticsConfig());

    expect(result.current).toEqual({
      clusterId: '',
      segmentKey: '',
    });
  });

  it('trims whitespace from extracted values', () => {
    const yamlContent = `
      SEGMENT_PUBLIC_API_KEY:   prod-segment-key
      CLUSTER_ID:   test-cluster-123
    `;

    (mockUseK8sWatchResource as any).mockReturnValue([
      { data: { [ConsoleConfigMap.ConfigKey]: yamlContent } },
      true,
    ]);

    const { result } = renderHook(() => useAnalyticsConfig());

    expect(result.current).toEqual({
      clusterId: 'test-cluster-123',
      segmentKey: 'prod-segment-key',
    });
  });
});

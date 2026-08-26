import type { V1beta1Plan } from '@forklift-ui/types';
import { CATEGORY_TYPES } from '@utils/constants';
import { renderHook } from '@testing-library/react-hooks';

import usePlanAlerts from '../usePlanAlerts';

const mockUseK8sWatchResource = jest.fn();
const mockUsePlanProviders = jest.fn();
const mockUseSourceStorages = jest.fn();
const mockUseSourceNetworks = jest.fn();
const mockUsePlanMappingData = jest.fn();
const mockGetPlanStatus = jest.fn();

jest.mock('@utils/i18n', () => ({
  t: (key: string) => key,
}));

jest.mock('@utils/hooks/useK8sWatchResource', () => ({
  useK8sWatchResource: (...args: unknown[]) => mockUseK8sWatchResource(...args),
}));

jest.mock('src/providers/hooks/usePlanSourceProvider', () => ({
  __esModule: true,
  default: (...args: unknown[]) => mockUsePlanProviders(...args),
}));

jest.mock('src/utils/hooks/useStorages', () => ({
  useSourceStorages: (...args: unknown[]) => mockUseSourceStorages(...args),
}));

jest.mock('src/utils/hooks/useNetworks', () => ({
  useSourceNetworks: (...args: unknown[]) => mockUseSourceNetworks(...args),
}));

jest.mock('src/plans/details/hooks/usePlanMappingData', () => ({
  usePlanMappingData: (...args: unknown[]) => mockUsePlanMappingData(...args),
}));

jest.mock('src/plans/details/components/PlanStatus/utils/planStatusResolver', () => ({
  getPlanStatus: (...args: unknown[]) => mockGetPlanStatus(...args),
}));

const plan = {
  metadata: { name: 'plan-1', namespace: 'openshift-mtv' },
  status: {
    conditions: [
      { category: CATEGORY_TYPES.CRITICAL, type: 'MapNotReady' },
      { category: CATEGORY_TYPES.WARNING, type: 'NetMapPreservingIPsOnPodNetwork' },
      { category: CATEGORY_TYPES.WARNING, type: 'VMMissingGuestIPs' },
      { category: CATEGORY_TYPES.WARNING, type: 'VMIpNotMatchingUdnSubnet' },
      { category: CATEGORY_TYPES.WARNING, type: 'OtherWarning' },
      { category: CATEGORY_TYPES.READY, type: 'Ready' },
    ],
  },
} as unknown as V1beta1Plan;

describe('usePlanAlerts - conditions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseK8sWatchResource
      .mockReturnValueOnce([[{ metadata: { name: 'nmap' } }], true, null])
      .mockReturnValueOnce([[{ metadata: { name: 'smap' } }], true, null]);
    mockUsePlanProviders.mockReturnValue([{}]);
    mockUseSourceStorages.mockReturnValue([[]]);
    mockUseSourceNetworks.mockReturnValue([[]]);
    mockUsePlanMappingData.mockReturnValue({
      sourceNetworks: [{ name: 'net-a' }],
      sourceStorages: [{ name: 'store-a' }],
    });
    mockGetPlanStatus.mockReturnValue('Ready');
  });

  it('exposes critical conditions and preserve-IP warnings only', () => {
    const { result } = renderHook(() => usePlanAlerts(plan));

    expect(result.current.showCriticalConditions).toBe(true);
    expect(result.current.criticalConditions).toHaveLength(1);
    expect(result.current.criticalConditions?.[0].type).toBe('MapNotReady');

    expect(result.current.showPreserveIPWarningsConditions).toBe(true);
    expect(result.current.preserveIPWarningsConditions?.map((c) => c.type)).toEqual([
      'NetMapPreservingIPsOnPodNetwork',
      'VMMissingGuestIPs',
      'VMIpNotMatchingUdnSubnet',
    ]);
    expect(result.current.status).toBe('Ready');
    expect(result.current.sourceNetworks).toEqual([{ name: 'net-a' }]);
    expect(result.current.sourceStorages).toEqual([{ name: 'store-a' }]);
  });

  it('hides alert flags when matching conditions are absent', () => {
    const quiet = {
      metadata: { name: 'plan-2', namespace: 'ns' },
      status: { conditions: [{ category: CATEGORY_TYPES.READY, type: 'Ready' }] },
    } as unknown as V1beta1Plan;

    const { result } = renderHook(() => usePlanAlerts(quiet));

    expect(result.current.showCriticalConditions).toBe(false);
    expect(result.current.showPreserveIPWarningsConditions).toBe(false);
    expect(result.current.criticalConditions).toEqual([]);
    expect(result.current.preserveIPWarningsConditions).toEqual([]);
  });

  it('surfaces network map watch errors and loaded state', () => {
    const watchError = new Error('nmap failed');
    mockUseK8sWatchResource.mockReset();
    mockUseK8sWatchResource
      .mockReturnValueOnce([[], false, watchError])
      .mockReturnValueOnce([[], true, null]);

    const { result } = renderHook(() => usePlanAlerts(plan));

    expect(result.current.networkMapsLoaded).toBe(false);
    expect(result.current.networkMapsError).toBe(watchError);
  });
});

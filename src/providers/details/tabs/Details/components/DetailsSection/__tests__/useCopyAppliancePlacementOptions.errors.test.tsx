import type { V1beta1Provider } from '@forklift-ui/types';
import { renderHook } from '@testing-library/react';

import { useCopyAppliancePlacementOptions } from '../useCopyAppliancePlacementOptions';

const provider = {
  metadata: { uid: 'provider-uid' },
  spec: { type: 'vsphere' },
} as V1beta1Provider;
const mockInventoryResponses: Record<
  string,
  { error: Error | null; inventory: { path: string }[] | null; loading: boolean }
> = {
  'folders?detail=1': { error: null, inventory: [], loading: false },
  'resourcepools?detail=1': { error: null, inventory: [], loading: false },
};
let mockStorageError: Error | null = null;
let mockNetworkError: Error | null = null;
const mockUseProviderInventory = jest.fn(
  ({ subPath }: { subPath: string }): (typeof mockInventoryResponses)[string] =>
    mockInventoryResponses[subPath],
);

jest.mock('@utils/hooks/useProviderInventory', (): unknown => ({
  __esModule: true,
  default: (options: { subPath: string }): unknown => mockUseProviderInventory(options),
}));
jest.mock('@utils/hooks/useStorages', (): unknown => ({
  useSourceStorages: (): [never[], boolean, Error | null] => [[], false, mockStorageError],
}));
jest.mock('@utils/hooks/useNetworks', (): unknown => ({
  useSourceNetworks: (): [never[], boolean, Error | null] => [[], false, mockNetworkError],
}));
jest.mock('src/utils/i18n', (): unknown => ({
  useForkliftTranslation: (): unknown => ({ t: (key: string): string => key }),
}));

describe('useCopyAppliancePlacementOptions inventory failures', () => {
  beforeEach(() => {
    mockStorageError = null;
    mockNetworkError = null;
    mockInventoryResponses['folders?detail=1'] = {
      error: null,
      inventory: [],
      loading: false,
    };
    mockInventoryResponses['resourcepools?detail=1'] = {
      error: null,
      inventory: [],
      loading: false,
    };
    mockUseProviderInventory.mockClear();
  });

  it('identifies a resource-pool endpoint failure after Provider readiness', () => {
    const poolError = new Error('404 Not Found');
    mockInventoryResponses['resourcepools?detail=1'].error = poolError;

    const { result } = renderHook(() => useCopyAppliancePlacementOptions(provider, '', false));

    expect(mockUseProviderInventory).toHaveBeenCalledWith(
      expect.objectContaining({ subPath: 'resourcepools?detail=1' }),
    );
    expect(result.current.inventoryLoading).toBe(false);
    expect(result.current.inventoryError).toBe(poolError);
    expect(result.current.inventoryErrors).toEqual({ resourcePool: poolError });
    expect(result.current.resourcePoolEndpointUnavailable).toBe(false);
  });

  it('identifies a missing resource-pool route when other inventory endpoints succeed', () => {
    mockInventoryResponses['resourcepools?detail=1'].error = Object.assign(
      new Error('404 Not Found'),
      { code: 404 },
    );

    const { result } = renderHook(() => useCopyAppliancePlacementOptions(provider, '', false));

    expect(result.current.resourcePoolEndpointUnavailable).toBe(true);
  });

  it('does not mistake ProviderNotFound for a missing resource-pool route', () => {
    mockInventoryResponses['resourcepools?detail=1'].error = Object.assign(
      new Error('Provider not found'),
      { code: 404, response: { headers: { get: (): string => 'ProviderNotFound' } } },
    );

    const { result } = renderHook(() => useCopyAppliancePlacementOptions(provider, '', false));

    expect(result.current.resourcePoolEndpointUnavailable).toBe(false);
  });

  it('does not infer a missing route when other inventory endpoints also fail', () => {
    mockStorageError = new Error('Inventory unavailable');
    mockInventoryResponses['resourcepools?detail=1'].error = Object.assign(
      new Error('404 Not Found'),
      { code: 404 },
    );

    const { result } = renderHook(() => useCopyAppliancePlacementOptions(provider, '', false));

    expect(result.current.resourcePoolEndpointUnavailable).toBe(false);
  });

  it('keeps independent datastore, network, and folder errors', () => {
    const datastoreError = new Error('403 Forbidden');
    const networkError = new Error('Network unavailable');
    const folderError = new Error('502 Bad Gateway');
    mockStorageError = datastoreError;
    mockNetworkError = networkError;
    mockInventoryResponses['folders?detail=1'].error = folderError;

    const { result } = renderHook(() => useCopyAppliancePlacementOptions(provider, '', false));

    expect(result.current.inventoryErrors).toEqual({
      datastore: datastoreError,
      folder: folderError,
      network: networkError,
    });
  });
});

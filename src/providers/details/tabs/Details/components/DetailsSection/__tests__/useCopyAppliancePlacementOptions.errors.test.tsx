import type { V1beta1Provider } from '@forklift-ui/types';
import { act, renderHook } from '@testing-library/react';

import { useCopyAppliancePlacementOptions } from '../useCopyAppliancePlacementOptions';

const provider = {
  metadata: { uid: 'provider-uid' },
  spec: { type: 'vsphere' },
} as V1beta1Provider;
const mockRefresh = jest.fn();
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
  default: (options: { subPath: string }): unknown => ({
    ...mockUseProviderInventory(options),
    forceRefresh: mockRefresh,
  }),
}));
jest.mock('@utils/hooks/useStorages', (): unknown => ({
  useSourceStorages: (): [never[], boolean, Error | null, () => void] => [
    [],
    false,
    mockStorageError,
    mockRefresh,
  ],
}));
jest.mock('@utils/hooks/useNetworks', (): unknown => ({
  useSourceNetworks: (): [never[], boolean, Error | null, () => void] => [
    [],
    false,
    mockNetworkError,
    mockRefresh,
  ],
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
    mockRefresh.mockClear();
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
  });

  it('refreshes every placement inventory without resetting the form', () => {
    const { result } = renderHook(() => useCopyAppliancePlacementOptions(provider, '/pool'));
    act(() => {
      result.current.onRetry();
    });
    expect(mockRefresh).toHaveBeenCalledTimes(4);
  });

  it('disables folder and resource-pool requests until a provider is available', () => {
    renderHook(() => useCopyAppliancePlacementOptions(undefined, ''));
    expect(mockUseProviderInventory).toHaveBeenCalledWith(
      expect.objectContaining({ disabled: true, provider: undefined, subPath: 'folders?detail=1' }),
    );
    expect(mockUseProviderInventory).toHaveBeenCalledWith(
      expect.objectContaining({
        disabled: true,
        provider: undefined,
        subPath: 'resourcepools?detail=1',
      }),
    );
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

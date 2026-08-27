import { consoleFetchJSON } from '@openshift-console/dynamic-plugin-sdk';
import { act, renderHook } from '@testing-library/react';

import useProviderInventory from '../useProviderInventory';

import {
  inventorySameIgnoredFields,
  inventorySample,
  validProvider,
} from './useProviderInventory.fixtures';

jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  consoleFetchJSON: jest.fn(),
}));

jest.mock('@utils/api/getApiUrl', () => ({
  getInventoryApiUrl: (path: string): string => `/inventory/${path}`,
}));

const mockFetch = consoleFetchJSON as jest.MockedFunction<typeof consoleFetchJSON>;

const flushPromises = async (): Promise<void> => {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
};

describe('useProviderInventory - fetch', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('loads inventory for a valid provider', async () => {
    mockFetch.mockResolvedValue(inventorySample);

    const { result } = renderHook(() => useProviderInventory({ provider: validProvider }));

    expect(result.current.loading).toBe(true);
    await flushPromises();

    expect(result.current.inventory).toEqual(inventorySample);
    expect(result.current.error).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(mockFetch).toHaveBeenCalledWith(
      '/inventory/providers/vsphere/provider-uid-1',
      'GET',
      {},
      undefined,
    );
  });

  it('appends subPath to the inventory URL', async () => {
    mockFetch.mockResolvedValue(inventorySample);

    renderHook(() => useProviderInventory({ provider: validProvider, subPath: 'vms' }));
    await flushPromises();

    expect(mockFetch).toHaveBeenCalledWith(
      '/inventory/providers/vsphere/provider-uid-1/vms',
      'GET',
      {},
      undefined,
    );
  });

  it('does not update inventory when only avoided fields change', async () => {
    mockFetch
      .mockResolvedValueOnce(inventorySample)
      .mockResolvedValueOnce(inventorySameIgnoredFields);

    const { result } = renderHook(() =>
      useProviderInventory({ interval: 1000, provider: validProvider }),
    );

    await flushPromises();
    const firstInventory = result.current.inventory;

    await act(async () => {
      jest.advanceTimersByTime(1000);
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(result.current.inventory).toBe(firstInventory);
  });

  it('forceRefresh triggers another fetch', async () => {
    mockFetch.mockResolvedValue(inventorySample);

    const { result } = renderHook(() => useProviderInventory({ provider: validProvider }));

    await flushPromises();
    expect(mockFetch).toHaveBeenCalledTimes(1);

    act(() => {
      result.current.forceRefresh();
    });
    await flushPromises();

    expect(mockFetch.mock.calls.length).toBeGreaterThan(1);
  });
});

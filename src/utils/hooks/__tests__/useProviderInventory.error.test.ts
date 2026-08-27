import { consoleFetchJSON } from '@openshift-console/dynamic-plugin-sdk';
import { act, renderHook } from '@testing-library/react';

import useProviderInventory from '../useProviderInventory';

import {
  providerMissingType,
  providerMissingUid,
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

describe('useProviderInventory - error', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('sets Invalid provider data when uid is missing', async () => {
    const { result } = renderHook(() => useProviderInventory({ provider: providerMissingUid }));

    await flushPromises();

    expect(result.current.error?.message).toBe('Invalid provider data');
    expect(result.current.inventory).toBeNull();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('sets Invalid provider data when type is missing', async () => {
    const { result } = renderHook(() => useProviderInventory({ provider: providerMissingType }));

    await flushPromises();

    expect(result.current.error?.message).toBe('Invalid provider data');
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('sets Invalid provider data when provider is undefined', async () => {
    const { result } = renderHook(() => useProviderInventory({ provider: undefined }));

    await flushPromises();

    expect(result.current.error?.message).toBe('Invalid provider data');
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('captures fetch errors and clears inventory', async () => {
    mockFetch.mockRejectedValue(new Error('network down'));

    const { result } = renderHook(() => useProviderInventory({ provider: validProvider }));

    await flushPromises();

    expect(result.current.error?.message).toBe('network down');
    expect(result.current.inventory).toBeNull();
    expect(result.current.loading).toBe(false);
  });
});

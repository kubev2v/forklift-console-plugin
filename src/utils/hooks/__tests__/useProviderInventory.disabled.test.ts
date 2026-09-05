import { consoleFetchJSON } from '@openshift-console/dynamic-plugin-sdk';
import { act, renderHook } from '@testing-library/react';

import useProviderInventory from '../useProviderInventory';

import { validProvider } from './useProviderInventory.fixtures';

jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  consoleFetchJSON: jest.fn(),
}));

jest.mock('@utils/api/getApiUrl', () => ({
  getInventoryApiUrl: (path: string): string => `/inventory/${path}`,
}));

const mockFetch = consoleFetchJSON as jest.MockedFunction<typeof consoleFetchJSON>;

describe('useProviderInventory - disabled', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns empty idle state when disabled', () => {
    const { result } = renderHook(() =>
      useProviderInventory({ disabled: true, provider: validProvider }),
    );

    expect(result.current).toEqual({
      error: null,
      forceRefresh: expect.any(Function),
      inventory: null,
      loading: false,
    });
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('does not fetch when disabled even after forceRefresh', () => {
    const { result } = renderHook(() =>
      useProviderInventory({ disabled: true, provider: validProvider }),
    );

    act(() => {
      result.current.forceRefresh();
    });

    expect(mockFetch).not.toHaveBeenCalled();
    expect(result.current.inventory).toBeNull();
    expect(result.current.loading).toBe(false);
  });
});

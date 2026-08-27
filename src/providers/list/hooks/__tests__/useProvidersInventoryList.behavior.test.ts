import type { ProvidersInventoryList } from '@forklift-ui/types';
import { consoleFetchJSON, useFlag } from '@openshift-console/dynamic-plugin-sdk';
import { act, renderHook } from '@testing-library/react';

import { getProvidersInventoryByNamespace } from '../../utils/getProvidersInventoryByNamespace';
import useProvidersInventoryList from '../useProvidersInventoryList';

jest.mock('@openshift-console/dynamic-plugin-sdk', (): unknown => ({
  consoleFetchJSON: jest.fn(),
  useFlag: jest.fn(),
}));

jest.mock('@utils/api/getApiUrl', (): unknown => ({
  getInventoryApiUrl: (path: string) => `/inventory/${path}`,
}));

jest.mock('../../utils/getProvidersInventoryByNamespace', (): unknown => ({
  getProvidersInventoryByNamespace: jest.fn(),
}));

const mockFetch = consoleFetchJSON as jest.MockedFunction<typeof consoleFetchJSON>;
const mockFlag = useFlag as jest.MockedFunction<typeof useFlag>;
const mockByNs = getProvidersInventoryByNamespace as jest.MockedFunction<
  typeof getProvidersInventoryByNamespace
>;

const clusterInventory = {
  vsphere: [{ name: 'vc', uid: 'uid-1' }],
} as unknown as ProvidersInventoryList;

const namespaceInventory = {
  ovirt: [{ name: 'rhv', uid: 'uid-2' }],
} as unknown as ProvidersInventoryList;

const flush = async (): Promise<void> => {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
};

describe('useProvidersInventoryList - behavior', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('fetches cluster inventory when CAN_LIST_NS is true', async () => {
    mockFlag.mockReturnValue(true);
    mockFetch.mockResolvedValue(clusterInventory);

    const { result } = renderHook(() => useProvidersInventoryList('ns', 1000));
    await flush();

    expect(mockFetch).toHaveBeenCalledWith('/inventory/providers?detail=1');
    expect(result.current.inventory).toEqual(clusterInventory);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('fetches namespace inventory when CAN_LIST_NS is false', async () => {
    mockFlag.mockReturnValue(false);
    mockByNs.mockResolvedValue(namespaceInventory);

    const { result } = renderHook(() => useProvidersInventoryList('team-a'));
    await flush();

    expect(mockByNs).toHaveBeenCalledWith('team-a');
    expect(result.current.inventory).toEqual(namespaceInventory);
  });

  it('sets error on fetch failure', async () => {
    mockFlag.mockReturnValue(true);
    mockFetch.mockRejectedValue(new Error('down'));

    const { result } = renderHook(() => useProvidersInventoryList());
    await flush();

    expect(result.current.error?.message).toBe('down');
    expect(result.current.loading).toBe(false);
  });
});

import type { V1beta1Provider } from '@forklift-ui/types';
import { beforeEach, describe, expect, it } from '@jest/globals';

import { getProvidersInventoryByNamespace } from '../getProvidersInventoryByNamespace';

const mockConsoleFetchJSON = jest.fn();
jest.mock('@openshift-console/dynamic-plugin-sdk', () => ({
  consoleFetchJSON: jest.fn((...args) => mockConsoleFetchJSON(...args)),
}));

const mockK8sGetProvidersByNamespace = jest.fn();
jest.mock('../../utils/k8sGetProvidersByNamespace', () => ({
  k8sGetProvidersByNamespace: jest.fn((...args) => mockK8sGetProvidersByNamespace(...args)),
}));

const makeProvider = (name: string, type: string, uid: string): V1beta1Provider =>
  ({
    metadata: { name, namespace: 'test-ns', uid },
    spec: { type },
    status: { phase: 'Ready' },
  }) as unknown as V1beta1Provider;

describe('getProvidersInventoryByNamespace', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('requests detail=1 on each per-provider inventory GET', async () => {
    mockK8sGetProvidersByNamespace.mockResolvedValue([
      makeProvider('hyperv-1', 'hyperv', 'uid-hv'),
    ]);
    mockConsoleFetchJSON.mockResolvedValueOnce({
      name: 'provider-uid-hv',
      networkCount: 2,
      type: 'hyperv',
      uid: 'uid-hv',
      vmCount: 5,
    });

    await getProvidersInventoryByNamespace('test-ns');

    expect(mockConsoleFetchJSON).toHaveBeenCalledTimes(1);
    const inventoryUrl = String(mockConsoleFetchJSON.mock.calls[0][0]);
    expect(inventoryUrl).toContain('providers/hyperv/uid-hv?detail=1');
    expect(inventoryUrl.split('?')).toHaveLength(2);
  });
});

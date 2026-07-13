import type { ProviderInventory, V1beta1Provider } from '@forklift-ui/types';
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

const makeInventoryResponse = (type: string, uid: string): ProviderInventory & { type: string } =>
  ({
    name: `provider-${uid}`,
    networkCount: 2,
    type,
    uid,
    vmCount: 5,
  }) as unknown as ProviderInventory & { type: string };

describe('getProvidersInventoryByNamespace', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns inventory for all successful providers', async () => {
    const providers = [
      makeProvider('ec2-1', 'ec2', 'uid-1'),
      makeProvider('ec2-2', 'ec2', 'uid-2'),
    ];

    mockK8sGetProvidersByNamespace.mockResolvedValue(providers);
    mockConsoleFetchJSON
      .mockResolvedValueOnce(makeInventoryResponse('ec2', 'uid-1'))
      .mockResolvedValueOnce(makeInventoryResponse('ec2', 'uid-2'));

    const result = await getProvidersInventoryByNamespace('test-ns');

    const extended = result as Record<string, ProviderInventory[]>;
    expect(extended.ec2).toHaveLength(2);
    expect(extended.ec2[0].uid).toBe('uid-1');
    expect(extended.ec2[1].uid).toBe('uid-2');
  });

  it('returns partial results when one provider fetch fails', async () => {
    const providers = [
      makeProvider('ec2-1', 'ec2', 'uid-1'),
      makeProvider('ec2-2', 'ec2', 'uid-2'),
    ];

    mockK8sGetProvidersByNamespace.mockResolvedValue(providers);
    mockConsoleFetchJSON
      .mockResolvedValueOnce(makeInventoryResponse('ec2', 'uid-1'))
      .mockRejectedValueOnce(new Error('Inventory not ready'));

    const result = await getProvidersInventoryByNamespace('test-ns');

    const extended = result as Record<string, ProviderInventory[]>;
    expect(extended.ec2).toHaveLength(1);
    expect(extended.ec2[0].uid).toBe('uid-1');
  });

  it('returns empty inventory when all provider fetches fail', async () => {
    const providers = [
      makeProvider('ec2-1', 'ec2', 'uid-1'),
      makeProvider('ec2-2', 'ec2', 'uid-2'),
    ];

    mockK8sGetProvidersByNamespace.mockResolvedValue(providers);
    mockConsoleFetchJSON
      .mockRejectedValueOnce(new Error('Not found'))
      .mockRejectedValueOnce(new Error('Not found'));

    const result = await getProvidersInventoryByNamespace('test-ns');

    expect(result).toEqual({});
  });

  it('filters out non-Ready providers', async () => {
    const providers = [
      makeProvider('ec2-ready', 'ec2', 'uid-1'),
      {
        ...makeProvider('ec2-staging', 'ec2', 'uid-2'),
        status: { phase: 'Staging' },
      } as unknown as V1beta1Provider,
    ];

    mockK8sGetProvidersByNamespace.mockResolvedValue(providers);
    mockConsoleFetchJSON.mockResolvedValueOnce(makeInventoryResponse('ec2', 'uid-1'));

    const result = await getProvidersInventoryByNamespace('test-ns');

    expect(mockConsoleFetchJSON).toHaveBeenCalledTimes(1);
    const extended = result as Record<string, ProviderInventory[]>;
    expect(extended.ec2).toHaveLength(1);
  });

  it('handles mixed provider types correctly', async () => {
    const providers = [
      makeProvider('vsphere-1', 'vsphere', 'uid-vs'),
      makeProvider('ec2-1', 'ec2', 'uid-ec2'),
    ];

    mockK8sGetProvidersByNamespace.mockResolvedValue(providers);
    mockConsoleFetchJSON
      .mockResolvedValueOnce(makeInventoryResponse('vsphere', 'uid-vs'))
      .mockResolvedValueOnce(makeInventoryResponse('ec2', 'uid-ec2'));

    const result = await getProvidersInventoryByNamespace('test-ns');

    expect(result?.vsphere).toHaveLength(1);
    const extended = result as Record<string, ProviderInventory[]>;
    expect(extended.ec2).toHaveLength(1);
  });
});

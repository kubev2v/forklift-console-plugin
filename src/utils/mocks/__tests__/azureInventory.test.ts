import type { V1beta1Provider } from '@forklift-ui/types';
import { afterEach, describe, expect, it } from '@jest/globals';

import { getAzureMockInventory, isAzureMockInventoryEnabled } from '../azureInventory';
import {
  AZURE_MOCK_NETWORKS,
  AZURE_MOCK_STORAGES,
  AZURE_MOCK_VMS,
} from '../azureInventory.fixtures';

const providerOfType = (type: string): V1beta1Provider => ({ spec: { type } }) as V1beta1Provider;

const azureProvider = providerOfType('azure');

describe('azureInventory mock', () => {
  afterEach(() => {
    process.env.AZURE_MOCK_INVENTORY = 'false';
  });

  it('is disabled by default', () => {
    expect(isAzureMockInventoryEnabled()).toBe(false);
    expect(getAzureMockInventory(azureProvider, 'vms')).toBeUndefined();
  });

  it('ignores non azure providers even when enabled', () => {
    process.env.AZURE_MOCK_INVENTORY = 'true';

    expect(getAzureMockInventory(providerOfType('ec2'), 'vms')).toBeUndefined();
    expect(getAzureMockInventory(undefined, 'vms')).toBeUndefined();
  });

  it('returns provider counts for the provider inventory path', () => {
    process.env.AZURE_MOCK_INVENTORY = 'true';

    expect(getAzureMockInventory(azureProvider, '')).toEqual({
      diskCount: 5,
      networkCount: AZURE_MOCK_NETWORKS.length,
      storageCount: AZURE_MOCK_STORAGES.length,
      type: 'azure',
      vmCount: AZURE_MOCK_VMS.length,
    });
  });

  it.each([
    ['vms?detail=4', AZURE_MOCK_VMS],
    ['networks', AZURE_MOCK_NETWORKS],
    ['storages?detail=1', AZURE_MOCK_STORAGES],
  ])('returns fixtures for %s', (subPath, expected) => {
    process.env.AZURE_MOCK_INVENTORY = 'true';

    expect(getAzureMockInventory(azureProvider, subPath)).toBe(expected);
  });

  it('returns undefined for unknown inventory sub paths', () => {
    process.env.AZURE_MOCK_INVENTORY = 'true';

    expect(getAzureMockInventory(azureProvider, 'disks')).toBeUndefined();
  });

  it('provides the network interfaces and disk types used by the plan wizard', () => {
    const [firstVm, , thirdVm] = AZURE_MOCK_VMS as {
      object?: {
        disks?: { sku?: string }[];
        networkInterfaces?: { id?: string }[];
      };
    }[];

    expect(firstVm?.object?.networkInterfaces).toHaveLength(1);
    expect(firstVm?.object?.disks?.map((vmDisk) => vmDisk.sku)).toEqual([
      'Premium_LRS',
      'Standard_LRS',
    ]);
    expect(thirdVm?.object?.networkInterfaces).toHaveLength(2);
  });
});

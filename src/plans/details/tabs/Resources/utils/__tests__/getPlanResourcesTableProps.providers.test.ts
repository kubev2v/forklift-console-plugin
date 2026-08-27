import type { ProviderVirtualMachine } from '@forklift-ui/types';
import { describe, expect, it } from '@jest/globals';
import { PROVIDER_TYPES } from '@utils/providers/constants';

import { getPlanResourcesTableProps } from '../utils';

const emptyInventory: ProviderVirtualMachine[] = [];

const emptyTotals = {
  planInventoryRunningSize: 0,
  planInventorySize: 0,
  totalResources: { cpuCount: 0, memoryMB: 0 },
  totalResourcesRunning: { cpuCount: 0, memoryMB: 0 },
};

describe('getPlanResourcesTableProps', () => {
  it.each([
    [PROVIDER_TYPES.ovirt, emptyTotals],
    [PROVIDER_TYPES.vsphere, emptyTotals],
    [PROVIDER_TYPES.ova, emptyTotals],
    [PROVIDER_TYPES.hyperv, emptyTotals],
  ])(
    'returns empty totals for %s with empty inventory',
    (providerType: string, expected: typeof emptyTotals) => {
      expect(getPlanResourcesTableProps(emptyInventory, providerType)).toEqual(expected);
    },
  );

  it('returns empty totals for openshift with empty inventory', () => {
    expect(getPlanResourcesTableProps(emptyInventory, PROVIDER_TYPES.openshift)).toEqual(
      emptyTotals,
    );
  });

  it('returns stub resource objects for openstack', () => {
    expect(getPlanResourcesTableProps(emptyInventory, PROVIDER_TYPES.openstack)).toEqual({
      planInventoryRunningSize: 0,
      planInventorySize: 0,
      totalResources: {},
      totalResourcesRunning: {},
    });
  });

  it('returns inventory sizes with empty resource objects for ec2', () => {
    const inventory = [{ id: 'i-1' }, { id: 'i-2' }] as unknown as ProviderVirtualMachine[];
    expect(getPlanResourcesTableProps(inventory, PROVIDER_TYPES.ec2)).toEqual({
      planInventoryRunningSize: 2,
      planInventorySize: 2,
      totalResources: {},
      totalResourcesRunning: {},
    });
  });

  it.each([undefined, '', 'unknown', 'azure'] as const)(
    'returns null for unsupported providerType %j',
    (providerType) => {
      expect(getPlanResourcesTableProps(emptyInventory, providerType)).toBeNull();
    },
  );

  it('aggregates vsphere cpu/memory and running size', () => {
    const inventory = [
      { cpuCount: 2, memoryMB: 1024, powerState: 'poweredOn' },
      { cpuCount: 4, memoryMB: 2048, powerState: 'poweredOff' },
    ] as unknown as ProviderVirtualMachine[];

    expect(getPlanResourcesTableProps(inventory, PROVIDER_TYPES.vsphere)).toEqual({
      planInventoryRunningSize: 1,
      planInventorySize: 2,
      totalResources: { cpuCount: 6, memoryMB: 3072 },
      totalResourcesRunning: { cpuCount: 2, memoryMB: 1024 },
    });
  });
});

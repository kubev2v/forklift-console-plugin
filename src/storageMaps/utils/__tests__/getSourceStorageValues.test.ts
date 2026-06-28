import { PROVIDER_TYPES } from 'src/providers/utils/constants';

import type { TypedOvaResource, V1beta1Provider } from '@forklift-ui/types';
import { describe, expect, it } from '@jest/globals';

import type { InventoryStorage } from '../../../utils/hooks/useStorages';
import { getSourceStorageValuesForSelectedVms } from '../getSourceStorageValues';

const makeOvaProvider = (): V1beta1Provider =>
  ({ spec: { type: PROVIDER_TYPES.ova } }) as unknown as V1beta1Provider;

const makeOvaStorage = (id: string, name: string): InventoryStorage =>
  ({
    id,
    name,
    providerType: PROVIDER_TYPES.ova,
    revision: 1,
    selfLink: '',
  }) as TypedOvaResource;

/**
 * Simulates the actual OVA API response for a VM with disks.
 *
 * The OVA backend returns embedded disk objects with PascalCase fields (e.g. ID),
 * while @forklift-ui/types defines them as camelCase (e.g. id).
 * This factory uses PascalCase to match real API responses.
 */
const makeOvaVm = (diskUppercaseID: string) => ({
  cpuCount: 1,
  // Simulates actual API response: disk uses PascalCase `ID`, not camelCase `id`
  disks: [
    {
      ID: diskUppercaseID,
      Capacity: 1073741824,
      CapacityAllocationUnits: 'byte * 2^30',
      DiskId: 'vmdisk1',
      FileRef: 'file1',
      FilePath: '/ova/vm.ova',
      Format: 'vmdk',
      Name: `${diskUppercaseID}.vmdk`,
      PopulatedSize: 1073741824,
      Revision: 0,
      Variant: '',
    },
  ],
  memoryMB: 1024,
  networks: [],
  powerState: 'On',
  providerType: PROVIDER_TYPES.ova,
});

describe('getSourceStorageValuesForSelectedVms — OVA', () => {
  const ovaProvider = makeOvaProvider();

  it('places storages into used when disk.ID (PascalCase) matches storage.id', () => {
    const hash = '2624ee502583f9280a1b885e281a45b51186';
    const storages = [makeOvaStorage(hash, 'disk1.vmdk')];
    const vms = [makeOvaVm(hash)];

    const result = getSourceStorageValuesForSelectedVms(ovaProvider, storages, vms as never);

    expect(result.used).toHaveLength(1);
    expect(result.used[0].id).toBe(hash);
    expect(result.other).toHaveLength(0);
  });

  it('does not match when disk.ID does not match any storage.id', () => {
    const storages = [makeOvaStorage('storage-hash-abc', 'disk1.vmdk')];
    const vms = [makeOvaVm('different-hash-xyz')];

    const result = getSourceStorageValuesForSelectedVms(ovaProvider, storages, vms as never);

    expect(result.used).toHaveLength(0);
    expect(result.other).toHaveLength(0);
  });

  it('handles VMs with multiple disks', () => {
    const hash1 = 'aabbccdd11223344556677889900aabbcc11';
    const hash2 = 'bbccddee22334455667788990011bbccdd22';
    const hash3 = 'ccddee0033445566778899001122ccddee33';

    const storages = [
      makeOvaStorage(hash1, 'disk1.vmdk'),
      makeOvaStorage(hash2, 'disk2.vmdk'),
      makeOvaStorage(hash3, 'disk3.vmdk'),
    ];
    const vm = {
      ...makeOvaVm(hash1),
      disks: [
        { ...makeOvaVm(hash1).disks[0], ID: hash1 },
        { ...makeOvaVm(hash2).disks[0], ID: hash2 },
      ],
    };

    const result = getSourceStorageValuesForSelectedVms(ovaProvider, storages, [vm] as never);

    expect(result.used).toHaveLength(2);
    const usedIds = result.used.map((storage) => storage.id);
    expect(usedIds).toContain(hash1);
    expect(usedIds).toContain(hash2);
    expect(result.other).toHaveLength(0);
  });

  it('returns empty used and other when no VMs are selected', () => {
    const storages = [makeOvaStorage('abc123', 'disk1.vmdk')];

    const result = getSourceStorageValuesForSelectedVms(ovaProvider, storages, []);

    expect(result.used).toHaveLength(0);
    expect(result.other).toHaveLength(0);
  });

  it('handles OVA disk with empty ID gracefully', () => {
    const storages = [makeOvaStorage('abc123', 'disk1.vmdk')];
    const vms = [makeOvaVm('')];

    const result = getSourceStorageValuesForSelectedVms(ovaProvider, storages, vms as never);

    expect(result.used).toHaveLength(0);
    expect(result.other).toHaveLength(0);
  });
});

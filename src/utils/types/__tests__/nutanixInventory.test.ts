import type {
  NutanixDisk,
  NutanixNIC,
  NutanixVM,
  ProviderVirtualMachine,
} from '@forklift-ui/types';
import { describe, expect, it } from '@jest/globals';
import { PROVIDER_TYPES } from '@utils/providers/constants';

import {
  getNutanixStorageContainerIds,
  getNutanixSubnetIds,
  isNutanixVm,
} from '../nutanixInventory';

type NutanixVmTestOverrides = Omit<Partial<NutanixVM>, 'disks' | 'nics'> & {
  disks?: Partial<NutanixDisk>[];
  nics?: Partial<NutanixNIC>[];
};

const makeVm = (overrides: Partial<ProviderVirtualMachine> = {}): ProviderVirtualMachine =>
  ({ providerType: PROVIDER_TYPES.nutanix, ...overrides }) as ProviderVirtualMachine;

const makeNutanixVm = (overrides: NutanixVmTestOverrides = {}): NutanixVM =>
  ({
    id: 'vm-1',
    name: 'test-vm',
    providerType: PROVIDER_TYPES.nutanix,
    ...overrides,
  }) as NutanixVM;

describe('isNutanixVm', () => {
  it('returns true for nutanix provider type', () => {
    expect(isNutanixVm(makeVm())).toBe(true);
  });

  it('returns false for vsphere provider type', () => {
    expect(isNutanixVm(makeVm({ providerType: PROVIDER_TYPES.vsphere }))).toBe(false);
  });

  it('returns false when providerType is omitted', () => {
    expect(isNutanixVm(makeVm({ providerType: undefined }))).toBe(false);
  });
});

describe('getNutanixSubnetIds', () => {
  it('extracts subnet UUIDs from NICs', () => {
    const vm = makeNutanixVm({
      nics: [{ subnetUuid: 'subnet-a' }, { subnetUuid: 'subnet-b' }],
    });
    expect(getNutanixSubnetIds(vm)).toEqual(['subnet-a', 'subnet-b']);
  });

  it('skips NICs with missing subnetUuid', () => {
    const vm = makeNutanixVm({
      nics: [{ subnetUuid: 'subnet-a' }, {}, { subnetUuid: 'subnet-c' }],
    });
    expect(getNutanixSubnetIds(vm)).toEqual(['subnet-a', 'subnet-c']);
  });

  it('returns empty array when nics is undefined', () => {
    expect(getNutanixSubnetIds(makeNutanixVm({ nics: undefined }))).toEqual([]);
  });

  it('returns empty array when nics is empty', () => {
    expect(getNutanixSubnetIds(makeNutanixVm({ nics: [] }))).toEqual([]);
  });
});

describe('getNutanixStorageContainerIds', () => {
  it('extracts storage container UUIDs from disks', () => {
    const vm = makeNutanixVm({
      disks: [{ storageContainerUuid: 'sc-a' }, { storageContainerUuid: 'sc-b' }],
    });
    expect(getNutanixStorageContainerIds(vm)).toEqual(['sc-a', 'sc-b']);
  });

  it('skips disks with missing storageContainerUuid', () => {
    const vm = makeNutanixVm({
      disks: [{ storageContainerUuid: 'sc-a' }, {}, { storageContainerUuid: 'sc-c' }],
    });
    expect(getNutanixStorageContainerIds(vm)).toEqual(['sc-a', 'sc-c']);
  });

  it('returns empty array when disks is undefined', () => {
    expect(getNutanixStorageContainerIds(makeNutanixVm({ disks: undefined }))).toEqual([]);
  });

  it('returns empty array when disks is empty', () => {
    expect(getNutanixStorageContainerIds(makeNutanixVm({ disks: [] }))).toEqual([]);
  });
});

import type { OVirtNicProfile, ProviderVirtualMachine } from '@forklift-ui/types';

import { getMultiNicSourceNetworks } from '../getMultiNicSourceNetworks';

const makeVSphereVm = (networkIds: string[]): ProviderVirtualMachine =>
  ({
    nics: networkIds.map((id) => ({ network: { id } })),
    providerType: 'vsphere',
  }) as unknown as ProviderVirtualMachine;

const makeOvirtVm = (nicProfiles: string[]): ProviderVirtualMachine =>
  ({
    nics: nicProfiles.map((profile) => ({ profile })),
    providerType: 'ovirt',
  }) as unknown as ProviderVirtualMachine;

describe('getMultiNicSourceNetworks', () => {
  it('returns empty map when all VMs have single NIC per network', () => {
    const vms = [makeVSphereVm(['net-1', 'net-2']), makeVSphereVm(['net-1', 'net-3'])];

    const result = getMultiNicSourceNetworks(vms);
    expect(result.size).toBe(0);
  });

  it('returns empty map when no VMs are provided', () => {
    const result = getMultiNicSourceNetworks([]);
    expect(result.size).toBe(0);
  });

  it('detects a VM with 2 NICs on the same network', () => {
    const vms = [makeVSphereVm(['net-1', 'net-1'])];

    const result = getMultiNicSourceNetworks(vms);
    expect(result.size).toBe(1);
    expect(result.get('net-1')).toEqual({ maxNicCount: 2, name: 'net-1' });
  });

  it('detects a VM with 3 NICs on the same network', () => {
    const vms = [makeVSphereVm(['net-1', 'net-1', 'net-1'])];

    const result = getMultiNicSourceNetworks(vms);
    expect(result.get('net-1')).toEqual({ maxNicCount: 3, name: 'net-1' });
  });

  it('takes the max NIC count across multiple VMs', () => {
    const vms = [
      makeVSphereVm(['net-1', 'net-1']),
      makeVSphereVm(['net-1', 'net-1', 'net-1']),
      makeVSphereVm(['net-1']),
    ];

    const result = getMultiNicSourceNetworks(vms);
    expect(result.get('net-1')?.maxNicCount).toBe(3);
  });

  it('handles multiple networks where only some have multi-NIC', () => {
    const vms = [makeVSphereVm(['net-1', 'net-1', 'net-2']), makeVSphereVm(['net-2', 'net-2'])];

    const result = getMultiNicSourceNetworks(vms);
    expect(result.size).toBe(2);
    expect(result.get('net-1')?.maxNicCount).toBe(2);
    expect(result.get('net-2')?.maxNicCount).toBe(2);
  });

  it('does not include networks that only have 1 NIC per VM', () => {
    const vms = [makeVSphereVm(['net-1', 'net-1', 'net-2', 'net-3'])];

    const result = getMultiNicSourceNetworks(vms);
    expect(result.has('net-1')).toBe(true);
    expect(result.has('net-2')).toBe(false);
    expect(result.has('net-3')).toBe(false);
  });

  it('resolves oVirt NIC profiles to network IDs', () => {
    const vms = [makeOvirtVm(['profile-a', 'profile-a'])];
    const nicProfiles = [{ id: 'profile-a', name: 'Profile A', network: 'ovirt-net-1' }];

    const result = getMultiNicSourceNetworks(vms, nicProfiles as unknown as OVirtNicProfile[]);
    expect(result.get('ovirt-net-1')?.maxNicCount).toBe(2);
  });

  it('handles oVirt VMs where NIC profile has no matching network', () => {
    const vms = [makeOvirtVm(['profile-x', 'profile-x'])];

    const result = getMultiNicSourceNetworks(vms);
    expect(result.get('profile-x')?.maxNicCount).toBe(2);
  });
});

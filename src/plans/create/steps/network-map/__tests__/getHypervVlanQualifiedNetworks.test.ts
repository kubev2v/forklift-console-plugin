import { PROVIDER_TYPES } from '@utils/providers/constants';

import { getHypervVlanQualifiedNetworks } from '../utils';

import { makeHypervVm, networks } from './vlanUtils.fixtures';

describe('getHypervVlanQualifiedNetworks', () => {
  it('returns empty when no VMs have VLAN conflicts', () => {
    const vms = [makeHypervVm('vm1', [{ networkId: 'net-a' }, { networkId: 'net-b' }])];
    expect(getHypervVlanQualifiedNetworks(vms, networks)).toEqual([]);
  });

  it('returns empty when single NIC per network even with VLAN set', () => {
    const vms = [
      makeHypervVm('vm1', [
        { networkId: 'net-a', vlanId: 100 },
        { networkId: 'net-b', vlanId: 200 },
      ]),
    ];
    expect(getHypervVlanQualifiedNetworks(vms, networks)).toEqual([]);
  });

  it('returns VLAN-qualified entries when multiple NICs share same network with different VLANs', () => {
    const vms = [
      makeHypervVm('vm1', [
        { networkId: 'net-a', vlanId: 100 },
        { networkId: 'net-a', vlanId: 200 },
      ]),
    ];
    const result = getHypervVlanQualifiedNetworks(vms, networks);
    expect(result).toHaveLength(2);
    expect(result).toContainEqual({
      id: 'net-a',
      name: 'Lab-External (VLAN 100)',
      vlan: '100',
    });
    expect(result).toContainEqual({
      id: 'net-a',
      name: 'Lab-External (VLAN 200)',
      vlan: '200',
    });
  });

  it('handles mixed tagged/untagged NICs on same network', () => {
    const vms = [
      makeHypervVm('vm1', [
        { networkId: 'net-a', vlanId: 100 },
        { networkId: 'net-a', vlanId: 0 },
      ]),
    ];
    const result = getHypervVlanQualifiedNetworks(vms, networks);
    expect(result).toHaveLength(2);
    expect(result).toContainEqual({
      id: 'net-a',
      name: 'Lab-External (VLAN 100)',
      vlan: '100',
    });
    expect(result).toContainEqual({
      id: 'net-a',
      name: 'Lab-External (Untagged)',
      vlan: '0',
    });
  });

  it('does not duplicate entries across multiple VMs', () => {
    const vms = [
      makeHypervVm('vm1', [
        { networkId: 'net-a', vlanId: 100 },
        { networkId: 'net-a', vlanId: 200 },
      ]),
      makeHypervVm('vm2', [
        { networkId: 'net-a', vlanId: 100 },
        { networkId: 'net-a', vlanId: 200 },
      ]),
    ];
    const result = getHypervVlanQualifiedNetworks(vms, networks);
    expect(result).toHaveLength(2);
  });

  it('returns empty when multiple NICs share same network with the SAME vlan', () => {
    const vms = [
      makeHypervVm('vm1', [
        { networkId: 'net-a', vlanId: 100 },
        { networkId: 'net-a', vlanId: 100 },
      ]),
    ];
    expect(getHypervVlanQualifiedNetworks(vms, networks)).toEqual([]);
  });

  it('ignores non-Hyper-V VMs', () => {
    const vms = [
      {
        name: 'vsphere-vm',
        providerType: PROVIDER_TYPES.vsphere,
        nics: [
          { network: { id: 'net-a' }, vlanId: 100 },
          { network: { id: 'net-a' }, vlanId: 200 },
        ],
      } as never,
    ];
    expect(getHypervVlanQualifiedNetworks(vms, networks)).toEqual([]);
  });
});

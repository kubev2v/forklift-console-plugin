import { PROVIDER_TYPES } from '@utils/providers/constants';

import { getSourceNetworkValues } from '../utils';

import { makeHypervVm } from './vlanUtils.fixtures';

describe('getSourceNetworkValues', () => {
  it('categorizes an unqualified OpenShift Multus network in the VM namespace as used', () => {
    const availableNetworks = [
      {
        id: 'nad-id',
        name: 'vlan16',
        namespace: 'utv00',
        providerType: PROVIDER_TYPES.openshift,
      },
    ] as never[];
    const vms = [
      {
        providerType: PROVIDER_TYPES.openshift,
        object: {
          metadata: { namespace: 'utv00' },
          spec: {
            template: {
              spec: {
                networks: [{ name: 'vlan16', multus: { networkName: 'vlan16' } }],
              },
            },
          },
        },
      },
    ] as never[];

    const result = getSourceNetworkValues(availableNetworks, vms, []);

    expect(result.used).toEqual([{ id: 'nad-id', name: 'utv00/vlan16' }]);
    expect(result.other).toEqual([]);
  });

  it('excludes plain network from used/other when VLAN-qualified entries exist', () => {
    const availableNetworks = [
      { id: 'net-a', name: 'Lab-External' },
      { id: 'net-b', name: 'Default Switch' },
    ] as never[];

    const vms = [
      makeHypervVm('vm1', [
        { networkId: 'net-a', vlanId: 100 },
        { networkId: 'net-a', vlanId: 200 },
        { networkId: 'net-b' },
      ]),
    ];

    const result = getSourceNetworkValues(availableNetworks, vms, []);

    const plainNetA = [...result.used, ...result.other].filter(
      (entry) => entry.id === 'net-a' && !entry.vlan,
    );
    expect(plainNetA).toHaveLength(0);

    const vlanEntries = result.used.filter((entry) => entry.id === 'net-a' && entry.vlan);
    expect(vlanEntries).toHaveLength(2);
    expect(
      vlanEntries.map((entry) => entry.vlan).sort((a, b) => (a ?? '').localeCompare(b ?? '')),
    ).toEqual(['100', '200']);

    const netB = [...result.used, ...result.other].find((entry) => entry.id === 'net-b');
    expect(netB).toBeDefined();
    expect(netB?.vlan).toBeUndefined();
  });
});

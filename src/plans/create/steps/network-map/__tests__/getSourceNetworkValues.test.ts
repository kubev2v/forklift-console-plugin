import { getSourceNetworkValues } from '../utils';

import { makeHypervVm } from './vlanUtils.fixtures';

describe('getSourceNetworkValues', () => {
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

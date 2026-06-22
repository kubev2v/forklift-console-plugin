import {
  buildNetworkMappings,
  getMappingValues,
} from 'src/networkMaps/create/utils/buildNetworkMappings';
import { NetworkMapFieldId } from 'src/networkMaps/utils/types';
import { PROVIDER_TYPES } from 'src/providers/utils/constants';

import {
  getHypervVlanQualifiedNetworks,
  getSourceNetworkValues,
  validateNetworkMap,
} from '../utils';

const makeHypervVm = (name: string, nics: { networkId: string; vlanId?: number }[]) =>
  ({
    name,
    providerType: PROVIDER_TYPES.hyperv,
    nics: nics.map((nic, idx) => ({
      name: `nic-${idx}`,
      mac: `00:00:00:00:00:0${idx}`,
      deviceIndex: idx,
      network: { kind: 'Network', id: nic.networkId },
      vlanId: nic.vlanId ?? 0,
    })),
  }) as never;

const networks = [
  { id: 'net-a', name: 'Lab-External' },
  { id: 'net-b', name: 'Default Switch' },
] as never[];

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

    // net-a should NOT appear in used/other as a plain entry
    const plainNetA = [...result.used, ...result.other].filter(
      (entry) => entry.id === 'net-a' && !entry.vlan,
    );
    expect(plainNetA).toHaveLength(0);

    // VLAN-qualified entries for net-a should be in 'used'
    const vlanEntries = result.used.filter((entry) => entry.id === 'net-a' && entry.vlan);
    expect(vlanEntries).toHaveLength(2);
    expect(
      vlanEntries.map((entry) => entry.vlan).sort((a, b) => (a ?? '').localeCompare(b ?? '')),
    ).toEqual(['100', '200']);

    // net-b should still appear as a plain entry (in used or other)
    const netB = [...result.used, ...result.other].find((entry) => entry.id === 'net-b');
    expect(netB).toBeDefined();
    expect(netB?.vlan).toBeUndefined();
  });
});

describe('validateNetworkMap with VLAN-qualified entries', () => {
  it('returns undefined when all VLAN-qualified networks are mapped', () => {
    const usedSourceNetworks = [
      { id: 'net-a', name: 'Lab-External (VLAN 100)', vlan: '100' },
      { id: 'net-a', name: 'Lab-External (VLAN 200)', vlan: '200' },
      { id: 'net-b', name: 'Default Switch' },
    ];
    const values = [
      {
        [NetworkMapFieldId.SourceNetwork]: {
          id: 'net-a',
          name: 'Lab-External (VLAN 100)',
          vlan: '100',
        },
        [NetworkMapFieldId.TargetNetwork]: { id: 'ns1', name: 'ns1/nad-a' },
      },
      {
        [NetworkMapFieldId.SourceNetwork]: {
          id: 'net-a',
          name: 'Lab-External (VLAN 200)',
          vlan: '200',
        },
        [NetworkMapFieldId.TargetNetwork]: { id: 'ns1', name: 'ns1/nad-b' },
      },
      {
        [NetworkMapFieldId.SourceNetwork]: { id: 'net-b', name: 'Default Switch' },
        [NetworkMapFieldId.TargetNetwork]: { id: '', name: 'Pod Networking' },
      },
    ];

    const result = validateNetworkMap({
      values,
      usedSourceNetworks,
      vms: {},
      oVirtNicProfiles: [],
    });
    expect(result).toBeUndefined();
  });

  it('returns error when a VLAN-qualified network is not mapped', () => {
    const usedSourceNetworks = [
      { id: 'net-a', name: 'Lab-External (VLAN 100)', vlan: '100' },
      { id: 'net-a', name: 'Lab-External (VLAN 200)', vlan: '200' },
    ];
    const values = [
      {
        [NetworkMapFieldId.SourceNetwork]: {
          id: 'net-a',
          name: 'Lab-External (VLAN 100)',
          vlan: '100',
        },
        [NetworkMapFieldId.TargetNetwork]: { id: 'ns1', name: 'ns1/nad-a' },
      },
    ];

    const result = validateNetworkMap({
      values,
      usedSourceNetworks,
      vms: {},
      oVirtNicProfiles: [],
    });
    expect(result).toBeDefined();
  });
});

describe('VLAN round-trip: form values → CR spec → form values', () => {
  it('preserves vlan field through buildNetworkMappings → getMappingValues', () => {
    const sourceProvider = { spec: { type: PROVIDER_TYPES.hyperv } } as never;
    const mappings = [
      {
        [NetworkMapFieldId.SourceNetwork]: {
          id: 'net-a',
          name: 'Lab-External (VLAN 100)',
          vlan: '100',
        },
        [NetworkMapFieldId.TargetNetwork]: { id: 'ns1', name: 'ns1/nad-a' },
      },
      {
        [NetworkMapFieldId.SourceNetwork]: {
          id: 'net-a',
          name: 'Lab-External (VLAN 200)',
          vlan: '200',
        },
        [NetworkMapFieldId.TargetNetwork]: { id: 'ns1', name: 'ns1/nad-b' },
      },
      {
        [NetworkMapFieldId.SourceNetwork]: { id: 'net-b', name: 'Default Switch' },
        [NetworkMapFieldId.TargetNetwork]: { id: '', name: 'Pod Networking' },
      },
    ];

    // Form → CR spec
    const specMappings = buildNetworkMappings(mappings, sourceProvider);

    // Verify vlan is in the CR spec
    const vlanEntries = specMappings.filter((entry) => (entry.source as { vlan?: string }).vlan);
    expect(vlanEntries).toHaveLength(2);

    // CR spec → Form values (round-trip back)
    const destinationNetworks = [
      { name: 'nad-a', namespace: 'ns1', uid: 'uid-a' },
      { name: 'nad-b', namespace: 'ns1', uid: 'uid-b' },
    ] as never[];
    const sourceNetworks = [
      { id: 'net-a', name: 'Lab-External' },
      { id: 'net-b', name: 'Default Switch' },
    ] as never[];

    const roundTripped = getMappingValues(
      specMappings,
      sourceProvider,
      sourceNetworks,
      destinationNetworks,
    );

    // Verify vlan survived the round-trip
    const vlan100 = roundTripped.find((mapping) => mapping.sourceNetwork.vlan === '100');
    const vlan200 = roundTripped.find((mapping) => mapping.sourceNetwork.vlan === '200');
    const noVlan = roundTripped.find((mapping) => mapping.sourceNetwork.id === 'net-b');

    expect(vlan100).toBeDefined();
    expect(vlan100?.sourceNetwork.id).toBe('net-a');
    expect(vlan200).toBeDefined();
    expect(vlan200?.sourceNetwork.id).toBe('net-a');
    expect(noVlan).toBeDefined();
    expect(noVlan?.sourceNetwork.vlan).toBeUndefined();
  });
});

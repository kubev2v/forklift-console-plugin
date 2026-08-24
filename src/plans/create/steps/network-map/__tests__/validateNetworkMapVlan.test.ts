import { NetworkMapFieldId } from '@utils/mappings/networkMap';

import { validateNetworkMap } from '../utils';

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

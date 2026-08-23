import {
  buildNetworkMappings,
  getMappingValues,
} from 'src/networkMaps/create/utils/buildNetworkMappings';

import { NetworkMapFieldId } from '@utils/mappings/networkMap';
import { PROVIDER_TYPES } from '@utils/providers/constants';

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

    const specMappings = buildNetworkMappings(mappings, sourceProvider);

    const vlanEntries = specMappings.filter((entry) => (entry.source as { vlan?: string }).vlan);
    expect(vlanEntries).toHaveLength(2);

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

import { describe, expect, it } from '@jest/globals';
import { DefaultNetworkLabel } from '@utils/mappings/constants';

import {
  hasMultiplePodNetworkMappings,
  hasPodNetworkMappings,
} from '../hasMultiplePodNetworkMappings';

describe('hasMultiplePodNetworkMappings - edgeCases', () => {
  it('returns true when a VM has two networks mapped to pod network', () => {
    const networkMap = [
      {
        sourceNetwork: { id: 'n1', name: 'n1' },
        targetNetwork: { name: DefaultNetworkLabel.Source },
      },
      {
        sourceNetwork: { id: 'n2', name: 'n2' },
        targetNetwork: { name: DefaultNetworkLabel.Source },
      },
    ] as never;

    const vms = {
      vm1: {
        id: 'vm1',
        name: 'vm1',
        networks: [{ id: 'n1' }, { id: 'n2' }],
        providerType: 'vsphere',
      },
    } as never;

    expect(hasMultiplePodNetworkMappings(networkMap, vms, [])).toBe(true);
  });

  it('returns false when networks are missing or only one maps to pod network', () => {
    const networkMap = [
      {
        sourceNetwork: { id: 'n1', name: 'n1' },
        targetNetwork: { name: DefaultNetworkLabel.Source },
      },
    ] as never;

    expect(
      hasMultiplePodNetworkMappings(
        networkMap,
        { vm1: { id: 'vm1', networks: [{ id: 'n1' }], providerType: 'vsphere' } } as never,
        [],
      ),
    ).toBe(false);

    expect(hasMultiplePodNetworkMappings(networkMap, { vm1: { id: 'vm1' } } as never, [])).toBe(
      false,
    );

    // two VMs each with a single pod-network mapping must not trip the per-VM invariant
    expect(
      hasMultiplePodNetworkMappings(
        networkMap,
        {
          vm1: { id: 'vm1', networks: [{ id: 'n1' }], providerType: 'vsphere' },
          vm2: { id: 'vm2', networks: [{ id: 'n1' }], providerType: 'vsphere' },
        } as never,
        [],
      ),
    ).toBe(false);
  });

  it('hasPodNetworkMappings detects pod network targets', () => {
    expect(hasPodNetworkMappings([])).toBe(false);
    expect(
      hasPodNetworkMappings([{ targetNetwork: { name: DefaultNetworkLabel.Source } }] as never),
    ).toBe(true);
  });
});

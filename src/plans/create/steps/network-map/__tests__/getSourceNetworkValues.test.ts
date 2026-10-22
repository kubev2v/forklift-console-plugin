import type {
  OpenShiftNetworkAttachmentDefinition,
  ProviderVirtualMachine,
} from '@forklift-ui/types';
import { PROVIDER_TYPES } from '@utils/providers/constants';

import { getSourceNetworkValues } from '../utils';

import { makeHypervVm } from './vlanUtils.fixtures';

const makeOpenShiftNetwork = (
  id: string,
  name: string,
  namespace: string,
): OpenShiftNetworkAttachmentDefinition => ({
  id,
  name,
  namespace,
  object: {
    apiVersion: 'k8s.cni.cncf.io/v1',
    kind: 'NetworkAttachmentDefinition',
  },
  providerType: PROVIDER_TYPES.openshift,
  selfLink: '',
  uid: '',
  version: '',
});

const makeOpenShiftVm = (
  namespace: string,
  networkName: string,
  multusNetworkName: string,
): ProviderVirtualMachine => ({
  id: 'vm-id',
  name: 'test-vm',
  namespace,
  object: {
    metadata: { namespace },
    spec: {
      template: {
        spec: {
          domain: { devices: {} },
          networks: [{ name: networkName, multus: { networkName: multusNetworkName } }],
        },
      },
    },
  },
  providerType: PROVIDER_TYPES.openshift,
  selfLink: '',
  uid: '',
  version: '',
});

describe('getSourceNetworkValues', () => {
  it('categorizes an unqualified OpenShift Multus network in the VM namespace as used', () => {
    const availableNetworks = [makeOpenShiftNetwork('nad-id', 'vlan16', 'utv00')];
    const vms = [makeOpenShiftVm('utv00', 'vlan16', 'vlan16')];

    const result = getSourceNetworkValues(availableNetworks, vms, []);

    expect(result.used).toEqual([{ id: 'nad-id', name: 'utv00/vlan16' }]);
    expect(result.other).toEqual([]);
  });

  it('preserves a qualified OpenShift Multus network from another namespace', () => {
    const availableNetworks = [makeOpenShiftNetwork('nad-id', 'vlan16', 'shared')];
    const vms = [makeOpenShiftVm('utv00', 'vlan16', 'shared/vlan16')];

    const result = getSourceNetworkValues(availableNetworks, vms, []);

    expect(result.used).toEqual([{ id: 'nad-id', name: 'shared/vlan16' }]);
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

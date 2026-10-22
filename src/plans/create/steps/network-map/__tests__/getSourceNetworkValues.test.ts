import { PROVIDER_TYPES } from 'src/providers/utils/constants';

import type {
  OpenShiftNetworkAttachmentDefinition,
  ProviderVirtualMachine,
} from '@forklift-ui/types';

import { getSourceNetworkValues } from '../utils';

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
});

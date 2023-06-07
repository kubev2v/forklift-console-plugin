/* eslint-disable @cspell/spellchecker */
import { OpenShiftNetworkAttachmentDefinition, OVirtNetwork, VSphereNetwork } from '@kubev2v/types';

import { NAMESPACE_FORKLIFT, NAMESPACE_MIGRATION } from '../utils';

import {
  OPENSHIFT_01_UID,
  OPENSHIFT_02_UID,
  OPENSHIFT_03_UID,
  OPENSHIFT_HOST_UID,
  OpenshiftProviderIDs,
  OVIRT_01_UID,
  OVIRT_02_UID,
  OVIRT_03_UID,
  OVIRT_INSECURE_UID,
  OvirtProviderIDs,
  VMWARE_01_UID,
  VMWARE_02_UID,
  VMWARE_03_UID,
  VmwareProviderIDs,
} from './providers.mock';

export const MOCK_VMWARE_NETWORKS: { [uid in VmwareProviderIDs]: VSphereNetwork[] } = {
  [VMWARE_01_UID]: [
    {
      id: '1',
      name: 'vmware-network-1',
      selfLink: `providers/vsphere/${VMWARE_01_UID}/networks/1`,
      path: '/V2V-DC/network/vDS-00',
      revision: 1,
      variant: '',
      host: [],
      parent: null,
    },
    {
      id: '2',
      name: 'vmware-network-2',
      selfLink: `providers/vsphere/${VMWARE_01_UID}/networks/2`,
      path: '/V2V-DC/network/vDS-00',
      revision: 1,
      variant: '',
      host: [],
      parent: null,
    },
  ],
  [VMWARE_02_UID]: [
    {
      id: '3',
      name: 'vmware-network-3',
      selfLink: `providers/vsphere/${VMWARE_02_UID}/networks/3`,
      path: '/V2V-DC/network/vDS-00',
      revision: 1,
      variant: '',
      host: [],
      parent: null,
    },
  ],
  [VMWARE_03_UID]: [
    {
      id: '4',
      name: 'vmware-network-4',
      selfLink: `providers/vsphere/${VMWARE_03_UID}/networks/4`,
      path: '/V2V-DC/network/vDS-00',
      revision: 1,
      variant: '',
      host: [],
      parent: null,
    },
    {
      id: '5',
      name: 'vmware-network-5',
      selfLink: `providers/vsphere/${VMWARE_03_UID}/networks/5`,
      path: '/V2V-DC/network/vDS-00',
      revision: 1,
      variant: '',
      host: [],
      parent: null,
    },
  ],
};

export const MOCK_RHV_NETWORKS: { [uid in OvirtProviderIDs]: OVirtNetwork[] } = {
  [OVIRT_01_UID]: [
    {
      id: '00000000-0000-0000-0000-000000000009',
      revision: 1,
      path: 'Default/ovirtmgmt',
      name: 'ovirtmgmt',
      description: 'this description is doubly improved',
      selfLink: `providers/ovirt/${OVIRT_01_UID}/networks/00000000-0000-0000-0000-000000000009`,
      dataCenter: '',
      vlan: '',
      usages: [],
      nicProfiles: [],
    },
    {
      id: '8b6f4200-cba6-4579-8edd-ea08b7ddd97b',
      revision: 1,
      path: 'Default/qosn',
      name: 'qosn',
      selfLink: `providers/ovirt/${OVIRT_01_UID}/networks/8b6f4200-cba6-4579-8edd-ea08b7ddd97b`,
      dataCenter: '',
      vlan: '',
      usages: [],
      nicProfiles: [],
    },
    {
      id: '0189c310-19e6-41e3-97b1-33894562b5fb',
      revision: 1,
      path: 'Default/test',
      name: 'test',
      selfLink: `providers/ovirt/${OVIRT_01_UID}/networks/0189c310-19e6-41e3-97b1-33894562b5fb`,
      dataCenter: '',
      vlan: '',
      usages: [],
      nicProfiles: [],
    },
  ],
  [OVIRT_02_UID]: [
    {
      id: '00000000-0000-0000-0000-000000000008',
      revision: 1,
      path: 'Default/ovirtmgmt',
      name: 'ovirtmgmt',
      description: 'test description',
      selfLink: `providers/ovirt/${OVIRT_02_UID}/networks/00000000-0000-0000-0000-000000000008`,
      dataCenter: '',
      vlan: '',
      usages: [],
      nicProfiles: [],
    },
  ],
  [OVIRT_03_UID]: [
    {
      id: '00000000-0000-0000-0000-000000000007',
      revision: 1,
      path: 'Default/ovirtmgmt',
      name: 'ovirtmgmt',
      description: 'test description',
      selfLink: `providers/ovirt/${OVIRT_03_UID}/networks/00000000-0000-0000-0000-000000000007`,
      dataCenter: '',
      vlan: '',
      usages: [],
      nicProfiles: [],
    },
  ],
  [OVIRT_INSECURE_UID]: [
    {
      id: '00000000-0000-0000-0000-000000000006',
      revision: 1,
      path: 'Default/ovirtmgmt',
      name: 'ovirtmgmt',
      description: 'test description',
      selfLink: `providers/ovirt/${OVIRT_INSECURE_UID}/networks/00000000-0000-0000-0000-000000000006`,
      dataCenter: '',
      vlan: '',
      usages: [],
      nicProfiles: [],
    },
  ],
};

export const MOCK_OPENSHIFT_NETWORKS: {
  [uid in OpenshiftProviderIDs]: OpenShiftNetworkAttachmentDefinition[];
} = {
  [OPENSHIFT_HOST_UID]: [
    {
      uid: 'e49f7782-7c59-4343-aac4-59a420201d07',
      version: '13180',
      namespace: NAMESPACE_FORKLIFT,
      name: 'example-network-1',
      selfLink: `providers/openshift/${OPENSHIFT_HOST_UID}/networkattachmentdefinitions/e49f7782-7c59-4343-aac4-59a420201d07`,
      object: {
        apiVersion: 'k8s.cni.cncf.io/v1',
        kind: 'NetworkAttachmentDefinition',
        metadata: {
          uid: 'e49f7782-7c59-4343-aac4-59a420201d07',
          resourceVersion: '13180',
          namespace: NAMESPACE_FORKLIFT,
          name: 'example-network-1',
        },
      },
    },
    {
      uid: '8b6f4200-cba6-4579-8edd-ea08b7ddd97b',
      version: '13',
      namespace: NAMESPACE_MIGRATION,
      name: 'example-network-2',
      selfLink: `providers/openshift/${OPENSHIFT_HOST_UID}/networkattachmentdefinitions/8b6f4200-cba6-4579-8edd-ea08b7ddd97b`,
      object: {
        apiVersion: 'k8s.cni.cncf.io/v1',
        kind: 'NetworkAttachmentDefinition',
        metadata: {
          uid: '8b6f4200-cba6-4579-8edd-ea08b7ddd97b',
          resourceVersion: '13',
          namespace: NAMESPACE_MIGRATION,
          name: 'example-network-2',
        },
      },
    },
  ],
  [OPENSHIFT_01_UID]: [
    {
      uid: 'foo-network-uid-1',
      namespace: 'remote-namespace-1',
      name: 'ocp-network-1',
      version: '1',
      selfLink: `providers/openshift/${OPENSHIFT_01_UID}/networkattachmentdefinitions/foo-network-uid-1`,
      object: {
        apiVersion: 'k8s.cni.cncf.io/v1',
        kind: 'NetworkAttachmentDefinition',
        metadata: {
          uid: 'foo-network-uid-1',
          namespace: 'remote-namespace-1',
          name: 'ocp-network-1',
        },
      },
    },
  ],
  [OPENSHIFT_02_UID]: [
    {
      uid: 'foo-network-uid-2',
      namespace: 'remote-namespace-2',
      name: 'ocp-network-2',
      version: '1',
      selfLink: `providers/openshift/${OPENSHIFT_02_UID}/networkattachmentdefinitions/foo-network-uid-2`,
      object: {
        apiVersion: 'k8s.cni.cncf.io/v1',
        kind: 'NetworkAttachmentDefinition',
        metadata: {
          uid: 'foo-network-uid-2',
          namespace: 'remote-namespace-2',
          name: 'ocp-network-2',
          resourceVersion: '1',
        },
      },
    },
  ],
  [OPENSHIFT_03_UID]: [
    {
      uid: 'foo-network-uid-3',
      namespace: 'remote-namespace-3',
      version: '1',
      name: 'ocp-network-3',
      selfLink: `providers/openshift/${OPENSHIFT_03_UID}/networkattachmentdefinitions/foo-network-uid-3`,
      object: {
        apiVersion: 'k8s.cni.cncf.io/v1',
        kind: 'NetworkAttachmentDefinition',
        metadata: {
          uid: 'foo-network-uid-3',
          namespace: 'remote-namespace-3',
          resourceVersion: '1',
          name: 'ocp-network-3',
        },
      },
    },
  ],
};

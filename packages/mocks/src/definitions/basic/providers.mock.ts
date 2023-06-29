/* eslint-disable @cspell/spellchecker */
import {
  ForkliftControllerModelGroupVersionKind,
  OpenshiftProvider,
  OpenstackProvider,
  OVirtProvider,
  ProviderModelGroupVersionKind as gvk,
  ProvidersInventoryList,
  V1beta1Provider,
  V1beta1ProviderStatus,
  VSphereProvider,
} from '@kubev2v/types';

import { EPOCH, NAMESPACE_FORKLIFT, NAMESPACE_MIGRATION } from '../utils';

export const OVIRT_01_UID = 'mock-uid-rhv-1';
export const OVIRT_02_UID = 'mock-uid-rhv-2';
export const OVIRT_03_UID = 'mock-uid-rhv-3';
export const OVIRT_INSECURE_UID = 'mock-uid-rhv-insecure';
export type OvirtProviderIDs =
  | typeof OVIRT_01_UID
  | typeof OVIRT_02_UID
  | typeof OVIRT_03_UID
  | typeof OVIRT_INSECURE_UID;

export const VMWARE_01_UID = 'mock-uid-vcenter-1';
export const VMWARE_02_UID = 'mock-uid-vcenter-2';
export const VMWARE_03_UID = 'mock-uid-vcenter-3';
export type VmwareProviderIDs = typeof VMWARE_01_UID | typeof VMWARE_02_UID | typeof VMWARE_03_UID;

export const OPENSTACK_01_UID = 'mock-uid-openstack-1';
export const OPENSTACK_02_UID = 'mock-uid-openstack-2';
export type OpenstackProviderIDs = typeof OPENSTACK_01_UID | typeof OPENSTACK_02_UID;

export const OPENSHIFT_01_UID = 'mock-uid-ocpv-1';
export const OPENSHIFT_02_UID = 'mock-uid-ocpv-2';
export const OPENSHIFT_03_UID = 'mock-uid-ocpv-3';
export const OPENSHIFT_HOST_UID = 'mock-uid-host';
export type OpenshiftProviderIDs =
  | typeof OPENSHIFT_01_UID
  | typeof OPENSHIFT_02_UID
  | typeof OPENSHIFT_03_UID
  | typeof OPENSHIFT_HOST_UID;

const providerStatusReadyFields: V1beta1ProviderStatus = {
  conditions: [
    {
      category: 'Required',
      lastTransitionTime: EPOCH.toISO(),
      message: 'Connection test, succeeded.',
      reason: 'Tested',
      status: 'True',
      type: 'ConnectionTestSucceeded',
    },
    {
      category: 'Advisory',
      lastTransitionTime: EPOCH.toISO(),
      message: 'Validation has been completed.',
      reason: 'Completed',
      status: 'True',
      type: 'Validated',
    },
    {
      category: 'Required',
      lastTransitionTime: EPOCH.toISO(),
      message: 'The inventory has been loaded.',
      reason: 'Completed',
      status: 'True',
      type: 'InventoryCreated',
    },
    {
      category: 'Required',
      lastTransitionTime: EPOCH.toISO(),
      message: 'The provider is ready.',
      status: 'True',
      type: 'Ready',
    },
  ],
  phase: 'Ready',
};

export const vmwareProvider1: VSphereProvider = {
  version: '14676',
  product: 'test-product',
  uid: VMWARE_01_UID,
  namespace: NAMESPACE_MIGRATION,
  name: 'vcenter-1',
  selfLink: `providers/vsphere/${VMWARE_01_UID}`,
  type: 'vsphere',
  object: {
    apiVersion: `${gvk.group}/${gvk.version}`,
    kind: 'Provider',
    metadata: {
      name: 'vcenter-1',
      namespace: NAMESPACE_MIGRATION,
      uid: VMWARE_01_UID,
      creationTimestamp: EPOCH.toISO(),
      resourceVersion: '14676',
      generation: 1,
    },
    spec: {
      type: 'vsphere',
      url: 'https://vcenter.v2v.bos.redhat.com/sdk',
      secret: {
        namespace: NAMESPACE_MIGRATION,
        name: 'mock-insecure',
      },
      settings: {
        vddkInitImage: 'quay.io/username/vddk',
      },
    },
    status: {
      ...providerStatusReadyFields,
    },
  },
  clusterCount: 2,
  hostCount: 2,
  vmCount: 41,
  networkCount: 8,
  datastoreCount: 3,
  datacenterCount: 0,
  apiVersion: 'v1beta1',
};

const vmwareProvider2: VSphereProvider = {
  ...vmwareProvider1,
  uid: VMWARE_02_UID,
  name: 'vcenter-2',
  selfLink: `providers/vsphere/${VMWARE_02_UID}`,
  object: {
    ...vmwareProvider1.object,
    metadata: {
      ...vmwareProvider1.object.metadata,
      name: 'vcenter-2',
      uid: VMWARE_02_UID,
      creationTimestamp: EPOCH.toISO(),
    },
    status: {
      conditions: [
        {
          type: 'URLNotValid',
          status: 'True',
          category: 'Critical',
          message: 'The provider is not responding.',
          lastTransitionTime: EPOCH.toISO(),
          reason: '',
        },
      ],
      phase: 'ConnectionFailed',
    },
  },
};

export const vmwareProvider3: VSphereProvider = {
  ...vmwareProvider1,
  uid: VMWARE_03_UID,
  name: 'vcenter-3',
  namespace: NAMESPACE_FORKLIFT,
  selfLink: `providers/vsphere/${VMWARE_03_UID}`,
  object: {
    ...vmwareProvider1.object,
    metadata: {
      ...vmwareProvider1.object.metadata,
      name: 'vcenter-3',
      namespace: NAMESPACE_FORKLIFT,
      uid: VMWARE_03_UID,
      creationTimestamp: EPOCH.toISO(),
    },
    status: {
      conditions: [
        {
          category: 'Required',
          lastTransitionTime: EPOCH.toISO(),
          message: 'Connection test, succeeded.',
          reason: 'Tested',
          status: 'True',
          type: 'ConnectionTestSucceeded',
        },
        {
          category: 'Advisory',
          lastTransitionTime: EPOCH.toISO(),
          message: 'Validation has been completed.',
          reason: 'Completed',
          status: 'True',
          type: 'Validated',
        },
        {
          category: 'Advisory',
          lastTransitionTime: EPOCH.toISO(),
          message: 'Loading the inventory.',
          reason: 'Started',
          status: 'True',
          type: 'LoadInventory',
        },
      ],
      phase: 'Staging',
    },
  },
};

const rhvProvider1: OVirtProvider = {
  version: '14873',
  uid: OVIRT_01_UID,
  namespace: NAMESPACE_FORKLIFT,
  name: 'rhv-1',
  selfLink: `providers/ovirt/${OVIRT_01_UID}`,
  type: 'ovirt',
  object: {
    kind: 'Provider',
    apiVersion: `${gvk.group}/${gvk.version}`,
    metadata: {
      name: 'rhv-1',
      namespace: NAMESPACE_FORKLIFT,
      uid: OVIRT_01_UID,
      creationTimestamp: EPOCH.toISO(),
      resourceVersion: '14873',
    },
    spec: {
      type: 'ovirt',
      url: 'https://rhvm.v2v.bos.redhat.com/ovirt-engine/api',
      secret: { namespace: NAMESPACE_FORKLIFT, name: 'mock-secure' },
    },
    status: {
      ...providerStatusReadyFields,
    },
  },
  datacenterCount: 1,
  clusterCount: 2,
  hostCount: 4,
  vmCount: 36,
  networkCount: 15,
  storageDomainCount: 9,
};

const rhvProvider1i: OVirtProvider = {
  ...rhvProvider1,
  uid: OVIRT_INSECURE_UID,
  name: 'rhv-1-insecure',
  selfLink: `providers/ovirt/${OVIRT_INSECURE_UID}`,
  object: {
    ...rhvProvider1.object,
    metadata: {
      ...rhvProvider1.object.metadata,
      name: 'rhv-1-insecure',
      uid: OVIRT_INSECURE_UID,
    },
    spec: {
      ...rhvProvider1.object.spec,
      secret: { namespace: NAMESPACE_FORKLIFT, name: 'mock-insecure' },
    },
  },
};

const rhvProvider2: OVirtProvider = {
  ...rhvProvider1,
  uid: OVIRT_02_UID,
  name: 'rhv-2',
  selfLink: `providers/ovirt/${OVIRT_02_UID}`,
  object: {
    ...rhvProvider1.object,
    metadata: {
      ...rhvProvider1.object.metadata,
      name: 'rhv-2',
      uid: OVIRT_02_UID,
    },
  },
};

const rhvProvider3: OVirtProvider = {
  ...rhvProvider1,
  uid: OVIRT_03_UID,
  name: 'rhv-3',
  selfLink: `providers/ovirt/${OVIRT_03_UID}`,
  object: {
    ...rhvProvider1.object,
    metadata: {
      ...rhvProvider1.object.metadata,
      name: 'rhv-3',
      uid: OVIRT_03_UID,
    },
  },
};

const openstackProvider1: OpenstackProvider = {
  version: '14874',
  uid: OPENSTACK_01_UID,
  namespace: NAMESPACE_FORKLIFT,
  name: 'openstack-insecure-1',
  selfLink: `providers/openstack/${OPENSTACK_01_UID}`,
  type: 'openstack',
  object: {
    kind: 'Provider',
    apiVersion: `${gvk.group}/${gvk.version}`,
    metadata: {
      name: 'openstack-insecure-1',
      namespace: NAMESPACE_FORKLIFT,
      uid: OPENSTACK_01_UID,
      creationTimestamp: EPOCH.toISO(),
      resourceVersion: '14874',
    },
    spec: {
      type: 'openstack',
      url: 'http://v2v.com:5000/v3',
      secret: { namespace: NAMESPACE_FORKLIFT, name: 'mock-insecure' },
    },
    status: {
      ...providerStatusReadyFields,
    },
  },
  regionCount: 1,
  projectCount: 1,
  vmCount: 3,
  imageCount: 1,
  volumeCount: 5,
  volumeTypeCount: 2,
  networkCount: 3,
};

const openstackProvider2: OpenstackProvider = {
  ...openstackProvider1,
  uid: OPENSTACK_02_UID,
  name: 'openstack-secure-2',
  selfLink: `providers/openstack/${OPENSTACK_02_UID}`,
  object: {
    ...openstackProvider1.object,
    metadata: {
      ...openstackProvider1.object.metadata,
      name: 'openstack-secure-2',
      uid: OPENSTACK_02_UID,
    },
    spec: {
      type: 'openstack',
      url: 'http://packstack.com:5000/v3',
      secret: { namespace: NAMESPACE_FORKLIFT, name: 'mock-secure' },
    },
  },
};

export const openshiftProvider1: OpenshiftProvider = {
  version: '14676',
  storageClassCount: 0,
  uid: OPENSHIFT_01_UID,
  namespace: NAMESPACE_MIGRATION,
  name: 'ocpv-1',
  selfLink: `providers/openshift/${OPENSHIFT_01_UID}`,
  type: 'openshift',
  object: {
    apiVersion: `${gvk.group}/${gvk.version}`,
    kind: 'Provider',
    metadata: {
      name: 'ocpv-1',
      namespace: NAMESPACE_MIGRATION,
      uid: OPENSHIFT_01_UID,
      resourceVersion: '14676',
      creationTimestamp: EPOCH.toISO(),
      annotations: {
        'forklift.konveyor.io/defaultTransferNetwork': 'ocp-network-3',
      },
    },
    spec: {
      type: 'openshift',
      url: 'https://my_OCPv_url',
      secret: {
        namespace: NAMESPACE_MIGRATION,
        name: 'mock-insecure',
      },
    },
    status: {
      ...providerStatusReadyFields,
    },
  },
  vmCount: 26,
  networkCount: 8,
};

const openshiftProvider2: OpenshiftProvider = {
  ...openshiftProvider1,
  uid: OPENSHIFT_02_UID,
  name: 'ocpv-2',
  selfLink: `providers/openshift/${OPENSHIFT_02_UID}`,
  object: {
    ...openshiftProvider1.object,
    metadata: {
      ...openshiftProvider1.object.metadata,
      name: 'ocpv-2',
      uid: OPENSHIFT_02_UID,
    },
    status: {
      conditions: [
        {
          type: 'URLNotValid',
          status: 'True',
          category: 'Critical',
          message: 'The provider is not responding.',
          lastTransitionTime: EPOCH.toISO(),
          reason: '',
        },
      ],
      phase: 'ConnectionFailed',
    },
  },
};

const openshiftProvider3: OpenshiftProvider = {
  ...openshiftProvider1,
  uid: OPENSHIFT_03_UID,
  namespace: NAMESPACE_FORKLIFT,
  name: 'ocpv-3',
  selfLink: `providers/openshift/${OPENSHIFT_03_UID}`,
  object: {
    ...openshiftProvider1.object,
    metadata: {
      ...openshiftProvider1.object.metadata,
      namespace: NAMESPACE_FORKLIFT,
      name: 'ocpv-3',
      uid: OPENSHIFT_03_UID,
    },
    spec: {
      ...openshiftProvider1.object.spec,
      url: '',
    },
  },
};

export const openshiftProviderHost: OpenshiftProvider = {
  ...openshiftProvider1,
  uid: OPENSHIFT_HOST_UID,
  namespace: NAMESPACE_FORKLIFT,
  name: 'host',
  selfLink: `providers/openshift/${OPENSHIFT_HOST_UID}`,
  object: {
    ...openshiftProvider1.object,
    metadata: {
      ...openshiftProvider1.object.metadata,
      namespace: NAMESPACE_FORKLIFT,
      name: 'host',
      uid: OPENSHIFT_HOST_UID,
      ownerReferences: [
        {
          apiVersion: `${ForkliftControllerModelGroupVersionKind.group}/${ForkliftControllerModelGroupVersionKind.version}`,
          kind: 'ForkliftController',
          name: 'forklift-controller',
          uid: '2d0a80a3-94a7-4fe5-b0cb-225cf5e24eac',
        },
      ],
    },
    spec: {
      ...openshiftProvider1.object.spec,
      url: '',
    },
  },
};

export const MOCK_INVENTORY_PROVIDERS: ProvidersInventoryList = {
  vsphere: [vmwareProvider1, vmwareProvider2, vmwareProvider3],
  ovirt: [rhvProvider1, rhvProvider1i, rhvProvider2, rhvProvider3],
  openstack: [openstackProvider1, openstackProvider2],
  openshift: [openshiftProvider1, openshiftProvider2, openshiftProvider3, openshiftProviderHost],
};

export const MOCK_CLUSTER_PROVIDERS: V1beta1Provider[] = [
  ...MOCK_INVENTORY_PROVIDERS.vsphere,
  ...MOCK_INVENTORY_PROVIDERS.ovirt,
  ...MOCK_INVENTORY_PROVIDERS.openstack,
  ...MOCK_INVENTORY_PROVIDERS.openshift,
].map((inventoryProvider) => ({ ...inventoryProvider.object }));

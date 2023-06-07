/* eslint-disable @cspell/spellchecker */
import {
  NetworkMapModelGroupVersionKind as netGvk,
  PlanModelGroupVersionKind,
  StorageMapModelGroupVersionKind as stGvk,
  V1beta1NetworkMap,
  V1beta1StorageMap,
} from '@kubev2v/types';

import { EPOCH, nameAndNamespace, NAMESPACE_FORKLIFT, NAMESPACE_MIGRATION } from '../utils';

import { MOCK_OPENSHIFT_NETWORKS, MOCK_VMWARE_NETWORKS } from './networks.mock';
import {
  OPENSHIFT_01_UID,
  OPENSHIFT_HOST_UID,
  openshiftProvider1,
  openshiftProviderHost,
  VMWARE_01_UID,
  VMWARE_03_UID,
  vmwareProvider1,
  vmwareProvider3,
} from './providers.mock';
import { MOCK_OPENSHIFT_STORAGE_CLASS, MOCK_VMWARE_DATASTORES } from './storages.mock';

const storageMapping1: V1beta1StorageMap = {
  apiVersion: `${stGvk.group}/${stGvk.version}`,
  kind: 'StorageMap',
  metadata: {
    uid: 'storage-map-01',
    name: 'vcenter1-datastore-to-ocpv-storageclass1',
    namespace: NAMESPACE_MIGRATION,
    annotations: { 'forklift.konveyor.io/shared': 'true' },
  },
  spec: {
    provider: {
      source: nameAndNamespace(vmwareProvider1),
      destination: nameAndNamespace(openshiftProvider1),
    },
    map: [
      {
        source: {
          id: MOCK_VMWARE_DATASTORES[VMWARE_01_UID][0].id,
        },
        destination: {
          storageClass: MOCK_OPENSHIFT_STORAGE_CLASS[OPENSHIFT_01_UID][0].name,
        },
      },
    ],
  },
  status: {
    conditions: [
      {
        category: 'Required',
        lastTransitionTime: EPOCH.toISO(),
        message: 'The storage map is ready.',
        status: 'True',
        type: 'Ready',
      },
    ],
  },
};

const storageMapping1WithOwner: V1beta1StorageMap = {
  ...storageMapping1,
  metadata: {
    ...storageMapping1.metadata,
    uid: 'storage-map-with-owner',
    name: 'plantest1-generated-asdf',
    annotations: { 'forklift.konveyor.io/shared': 'false' },
    ownerReferences: [
      {
        apiVersion: `${PlanModelGroupVersionKind.group}/${PlanModelGroupVersionKind.version}`,
        kind: 'Plan',
        name: 'plantest-01',
        uid: '28fde094-b667-4d21-8f29-27c18f22178c',
      },
    ],
  },
};

const storageMapping2: V1beta1StorageMap = {
  apiVersion: `${stGvk.group}/${stGvk.version}`,
  kind: 'StorageMap',
  metadata: {
    uid: 'storage-map-02',
    name: 'vcenter3-datastore-to-ocpv-storageclass2',
    namespace: NAMESPACE_FORKLIFT,
    annotations: { 'forklift.konveyor.io/shared': 'true' },
  },
  spec: {
    provider: {
      source: nameAndNamespace(vmwareProvider3),
      destination: nameAndNamespace(openshiftProviderHost),
    },
    map: [
      {
        source: {
          name: MOCK_VMWARE_DATASTORES[VMWARE_03_UID][0].name,
        },
        destination: {
          storageClass: MOCK_OPENSHIFT_STORAGE_CLASS[OPENSHIFT_HOST_UID][1].name,
        },
      },
    ],
  },
  status: {
    conditions: [
      {
        category: 'Required',
        lastTransitionTime: EPOCH.toISO(),
        message: 'The storage map is ready.',
        status: 'True',
        type: 'Ready',
      },
    ],
  },
};

const invalidStorageMapping: V1beta1StorageMap = {
  apiVersion: `${stGvk.group}/${stGvk.version}`,
  kind: 'StorageMap',
  metadata: {
    name: 'vcenter1-invalid-storage-mapping',
    namespace: NAMESPACE_FORKLIFT,
    annotations: { 'forklift.konveyor.io/shared': 'true' },
  },
  spec: {
    provider: {
      source: nameAndNamespace(vmwareProvider3),
      destination: nameAndNamespace(openshiftProviderHost),
    },
    map: [
      {
        source: {
          id: 'invalid-id',
        },
        destination: {
          storageClass: MOCK_OPENSHIFT_STORAGE_CLASS[OPENSHIFT_HOST_UID][0].name,
        },
      },
    ],
  },
  status: {
    conditions: [
      {
        category: 'Critical',
        lastTransitionTime: EPOCH.toISO(),
        message: 'Source storage not found.',
        reason: 'NotFound',
        status: 'True',
        type: 'SourceStorageNotValid',
      },
    ],
  },
};

export const MOCK_STORAGE_MAPPINGS: V1beta1StorageMap[] = [
  storageMapping1,
  storageMapping1WithOwner,
  storageMapping2,
  invalidStorageMapping,
];

const sourceNetwork_01 = MOCK_VMWARE_NETWORKS[VMWARE_01_UID][0];
export const networkMapping1: V1beta1NetworkMap = {
  apiVersion: `${netGvk.group}/${netGvk.version}`,
  kind: 'NetworkMap',
  metadata: {
    name: 'vcenter1-netstore-to-ocp1-network1',
    namespace: NAMESPACE_MIGRATION,
    uid: 'network-map-01-uid',
    annotations: { 'forklift.konveyor.io/shared': 'true' },
  },
  spec: {
    provider: {
      source: nameAndNamespace(vmwareProvider1),
      destination: nameAndNamespace(openshiftProvider1),
    },
    map: [
      {
        source: {
          id: sourceNetwork_01.id,
        },
        destination: {
          ...nameAndNamespace(MOCK_OPENSHIFT_NETWORKS[OPENSHIFT_01_UID][0]),
          type: 'multus',
        },
      },
    ],
  },
  status: {
    conditions: [
      {
        category: 'Required',
        lastTransitionTime: EPOCH.toISO(),
        message: 'The network map is ready.',
        status: 'True',
        type: 'Ready',
      },
    ],
    references: [
      {
        id: sourceNetwork_01.id,
        name: sourceNetwork_01.name,
      },
    ],
  },
};

const networkMapping1WithOwner: V1beta1NetworkMap = {
  ...networkMapping1,
  metadata: {
    ...networkMapping1.metadata,
    uid: 'network-map-with-owner-uid',
    name: 'plantest1-generated-zxcv',
    annotations: { 'forklift.konveyor.io/shared': 'false' },
    ownerReferences: [
      {
        apiVersion: `${PlanModelGroupVersionKind.group}/${PlanModelGroupVersionKind.version}`,
        kind: 'Plan',
        name: 'plantest-01',
        uid: '28fde094-b667-4d21-8f29-27c18f22178c',
      },
    ],
  },
};

export const networkMapping2: V1beta1NetworkMap = {
  apiVersion: `${netGvk.group}/${netGvk.version}`,
  kind: 'NetworkMap',
  metadata: {
    name: 'vcenter3-netstore-to-ocp-host-network2',
    namespace: NAMESPACE_FORKLIFT,
    uid: 'network-map-02-uid',
    annotations: { 'forklift.konveyor.io/shared': 'true' },
  },
  spec: {
    provider: {
      source: nameAndNamespace(vmwareProvider3),
      destination: nameAndNamespace(openshiftProviderHost),
    },
    map: [
      {
        source: {
          name: MOCK_VMWARE_NETWORKS[VMWARE_03_UID][0].name,
        },
        destination: {
          ...nameAndNamespace(MOCK_OPENSHIFT_NETWORKS[OPENSHIFT_HOST_UID][0]),
          type: 'multus',
        },
      },
      {
        source: {
          id: MOCK_VMWARE_NETWORKS[VMWARE_03_UID][1].id,
        },
        destination: {
          ...nameAndNamespace(MOCK_OPENSHIFT_NETWORKS[OPENSHIFT_HOST_UID][0]),
          type: 'multus',
        },
      },
    ],
  },
  status: {
    conditions: [
      {
        category: 'Required',
        lastTransitionTime: EPOCH.toISO(),
        message: 'The network map is ready.',
        status: 'True',
        type: 'Ready',
      },
    ],
  },
};

const invalidNetworkMappingDueToNetwork: V1beta1NetworkMap = {
  apiVersion: `${netGvk.group}/${netGvk.version}`,
  kind: 'NetworkMap',
  metadata: {
    name: 'vcenter3-invalid-network-map',
    namespace: NAMESPACE_FORKLIFT,
    uid: 'network-map-invalid-01-uid',
    annotations: { 'forklift.konveyor.io/shared': 'true' },
  },
  spec: {
    provider: {
      source: nameAndNamespace(vmwareProvider3),
      destination: nameAndNamespace(openshiftProviderHost),
    },
    map: [
      {
        source: {
          id: MOCK_VMWARE_NETWORKS[VMWARE_03_UID][1].id,
        },
        destination: {
          type: 'multus',
          name: 'missing-network',
          namespace: 'doesnt-matter',
        },
      },
    ],
  },
  status: {
    conditions: [
      {
        category: 'Critical',
        items: [],
        lastTransitionTime: EPOCH.toISO(),
        message: 'Destination network (NAD) not found.',
        reason: 'NotFound',
        status: 'True',
        type: 'DestinationNetworkNotValid',
      },
    ],
  },
};

const invalidNetworkMappingDueToProvider: V1beta1NetworkMap = {
  apiVersion: `${netGvk.group}/${netGvk.version}`,
  kind: 'NetworkMap',
  metadata: {
    name: 'invalid-network-map',
    namespace: NAMESPACE_MIGRATION,
    uid: 'network-map-invalid-02-uid',
    annotations: { 'forklift.konveyor.io/shared': 'true' },
  },
  spec: {
    provider: {
      source: { namespace: 'unknown-ns', name: 'unknown-provider' },
      destination: nameAndNamespace(openshiftProvider1),
    },
    map: [
      {
        source: {
          id: MOCK_VMWARE_NETWORKS[VMWARE_01_UID][0].id,
        },
        destination: {
          ...nameAndNamespace(MOCK_OPENSHIFT_NETWORKS[OPENSHIFT_01_UID][0]),
          type: 'multus',
        },
      },
    ],
  },
  status: {
    conditions: [
      {
        category: 'Critical',
        lastTransitionTime: EPOCH.toISO(),
        message: 'The source provider is not valid.',
        reason: 'NotFound',
        status: 'True',
        type: 'SourceProviderNotValid',
      },
    ],
  },
};

export const MOCK_NETWORK_MAPPINGS: V1beta1NetworkMap[] = [
  networkMapping1,
  networkMapping1WithOwner,
  networkMapping2,
  invalidNetworkMappingDueToNetwork,
  invalidNetworkMappingDueToProvider,
];

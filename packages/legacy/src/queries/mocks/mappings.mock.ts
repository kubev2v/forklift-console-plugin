import { IStorageMapping, INetworkMapping } from '../types/mappings.types';
import { MOCK_STORAGE_CLASSES_BY_PROVIDER } from './storages.mock';
import { MOCK_INVENTORY_PROVIDERS } from './providers.mock';
import { MOCK_OPENSHIFT_NETWORKS, MOCK_VMWARE_NETWORKS } from './networks.mock';
import { MOCK_VMWARE_DATASTORES } from './storages.mock';
import { nameAndNamespace } from '../helpers';
import { CLUSTER_API_VERSION, ENV } from 'legacy/src/common/constants';

export let MOCK_NETWORK_MAPPINGS: INetworkMapping[] = [];
export let MOCK_STORAGE_MAPPINGS: IStorageMapping[] = [];

if (process.env.NODE_ENV === 'test' || process.env.DATA_SOURCE === 'mock') {
  const storageMapping1: IStorageMapping = {
    apiVersion: CLUSTER_API_VERSION,
    kind: 'StorageMap',
    metadata: {
      name: 'vcenter1-datastore-to-ocpv-storageclass1',
      namespace: ENV.NAMESPACE,
      annotations: { 'forklift.konveyor.io/shared': 'true' },
    },
    spec: {
      provider: {
        source: nameAndNamespace(MOCK_INVENTORY_PROVIDERS.vsphere[0]),
        destination: nameAndNamespace(MOCK_INVENTORY_PROVIDERS.openshift[0]),
      },
      map: [
        {
          source: {
            id: MOCK_VMWARE_DATASTORES[0].id,
          },
          destination: {
            storageClass: MOCK_STORAGE_CLASSES_BY_PROVIDER['ocpv-1'][1].name,
          },
        },
      ],
    },
  };

  const storageMapping1WithOwner: IStorageMapping = {
    ...storageMapping1,
    metadata: {
      ...storageMapping1.metadata,
      name: 'plantest1-generated-asdf',
      annotations: { 'forklift.konveyor.io/shared': 'false' },
      ownerReferences: [
        {
          apiVersion: CLUSTER_API_VERSION,
          kind: 'Plan',
          name: 'plantest-01',
          namespace: 'openshift-migration',
          uid: '28fde094-b667-4d21-8f29-27c18f22178c',
        },
      ],
    },
  };

  const storageMapping2: IStorageMapping = {
    apiVersion: CLUSTER_API_VERSION,
    kind: 'StorageMap',
    metadata: {
      name: 'vcenter3-datastore-to-ocpv-storageclass2',
      namespace: ENV.NAMESPACE,
      annotations: { 'forklift.konveyor.io/shared': 'true' },
    },
    spec: {
      provider: {
        source: nameAndNamespace(MOCK_INVENTORY_PROVIDERS.vsphere[2]),
        destination: nameAndNamespace(MOCK_INVENTORY_PROVIDERS.openshift[0]),
      },
      map: [
        {
          source: {
            name: MOCK_VMWARE_DATASTORES[1].name,
          },
          destination: {
            storageClass: MOCK_STORAGE_CLASSES_BY_PROVIDER['ocpv-1'][1].name,
          },
        },
      ],
    },
  };

  const invalidStorageMapping: IStorageMapping = {
    apiVersion: CLUSTER_API_VERSION,
    kind: 'StorageMap',
    metadata: {
      name: 'vcenter1-invalid-storage-mapping',
      namespace: ENV.NAMESPACE,
      annotations: { 'forklift.konveyor.io/shared': 'true' },
    },
    spec: {
      provider: {
        source: nameAndNamespace(MOCK_INVENTORY_PROVIDERS.vsphere[2]),
        destination: nameAndNamespace(MOCK_INVENTORY_PROVIDERS.openshift[0]),
      },
      map: [
        {
          source: {
            id: 'invalid-id',
          },
          destination: {
            storageClass: MOCK_STORAGE_CLASSES_BY_PROVIDER['ocpv-1'][1].name,
          },
        },
      ],
    },
  };

  MOCK_STORAGE_MAPPINGS = [
    storageMapping1,
    storageMapping1WithOwner,
    storageMapping2,
    invalidStorageMapping,
  ];

  const networkMapping1: INetworkMapping = {
    apiVersion: CLUSTER_API_VERSION,
    kind: 'NetworkMap',
    metadata: {
      name: 'vcenter1-netstore-to-ocp1-network1',
      namespace: ENV.NAMESPACE,
      annotations: { 'forklift.konveyor.io/shared': 'true' },
    },
    spec: {
      provider: {
        source: nameAndNamespace(MOCK_INVENTORY_PROVIDERS.vsphere[0]),
        destination: nameAndNamespace(MOCK_INVENTORY_PROVIDERS.openshift[0]),
      },
      map: [
        {
          source: {
            id: MOCK_VMWARE_NETWORKS[0].id,
          },
          destination: {
            ...nameAndNamespace(MOCK_OPENSHIFT_NETWORKS[0]),
            type: 'multus',
          },
        },
      ],
    },
  };

  const networkMapping1WithOwner: INetworkMapping = {
    ...networkMapping1,
    metadata: {
      ...networkMapping1.metadata,
      name: 'plantest1-generated-zxcv',
      annotations: { 'forklift.konveyor.io/shared': 'false' },
      ownerReferences: [
        {
          apiVersion: CLUSTER_API_VERSION,
          kind: 'Plan',
          name: 'plantest-01',
          namespace: 'openshift-migration',
          uid: '28fde094-b667-4d21-8f29-27c18f22178c',
        },
      ],
    },
  };

  const networkMapping2: INetworkMapping = {
    apiVersion: CLUSTER_API_VERSION,
    kind: 'NetworkMap',
    metadata: {
      name: 'vcenter1-netstore-to-ocp1-network2',
      namespace: ENV.NAMESPACE,
      annotations: { 'forklift.konveyor.io/shared': 'true' },
    },
    spec: {
      provider: {
        source: nameAndNamespace(MOCK_INVENTORY_PROVIDERS.vsphere[0]),
        destination: nameAndNamespace(MOCK_INVENTORY_PROVIDERS.openshift[1]),
      },
      map: [
        {
          source: {
            name: MOCK_VMWARE_NETWORKS[1].name,
          },
          destination: {
            ...nameAndNamespace(MOCK_OPENSHIFT_NETWORKS[1]),
            type: 'multus',
          },
        },
        {
          source: {
            id: MOCK_VMWARE_NETWORKS[2].id,
          },
          destination: {
            ...nameAndNamespace(MOCK_OPENSHIFT_NETWORKS[1]),
            type: 'multus',
          },
        },
        {
          source: {
            name: MOCK_VMWARE_NETWORKS[0].name,
          },
          destination: {
            ...nameAndNamespace(MOCK_OPENSHIFT_NETWORKS[0]),
            type: 'multus',
          },
        },
        {
          source: {
            id: MOCK_VMWARE_NETWORKS[3].id,
          },
          destination: {
            ...nameAndNamespace(MOCK_OPENSHIFT_NETWORKS[2]),
            type: 'multus',
          },
        },
      ],
    },
  };

  const invalidNetworkMapping: INetworkMapping = {
    apiVersion: CLUSTER_API_VERSION,
    kind: 'NetworkMap',
    metadata: {
      name: 'vcenter3-invalid-network-map',
      namespace: ENV.NAMESPACE,
      annotations: { 'forklift.konveyor.io/shared': 'true' },
    },
    spec: {
      provider: {
        source: {namespace: 'unknown-ns', name: 'unknown-provider'},
        destination: nameAndNamespace(MOCK_INVENTORY_PROVIDERS.openshift[0]),
      },
      map: [
        {
          source: {
            id: MOCK_VMWARE_NETWORKS[1].id,
          },
          destination: {
            type: 'multus',
            name: 'missing-network',
            namespace: 'doesnt-matter',
          },
        },
      ],
    },
  };

  MOCK_NETWORK_MAPPINGS = [
    networkMapping1,
    networkMapping1WithOwner,
    networkMapping2,
    invalidNetworkMapping,
  ];
}

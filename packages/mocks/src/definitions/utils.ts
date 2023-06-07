/* eslint-disable @cspell/spellchecker */
import { DateTime } from 'luxon';

import {
  ForkliftControllerModelGroupVersionKind,
  InventoryByType,
  IoK8sApimachineryPkgApisMetaV1ObjectMeta,
  OpenShiftNamespace,
  OpenShiftNetworkAttachmentDefinition,
  OpenShiftStorageClass,
  OpenstackTreeNode,
  OpenstackVolumeType,
  OVirtDisk,
  OVirtNetwork,
  OVirtNicProfile,
  OVirtStorageDomain,
  OvirtTreeNode,
  OVirtVM,
  V1beta1Provider,
  VSphereDataStore,
  VSphereHostInventory,
  VSphereNetwork,
  VSphereTreeNode,
  VSphereVM,
} from '@kubev2v/types';
import { V1beta1PlanSpecProviderDestination } from '@kubev2v/types/src/models/V1beta1PlanSpecProviderDestination';
import { V1beta1PlanSpecProviderSource } from '@kubev2v/types/src/models/V1beta1PlanSpecProviderSource';

export const NAMESPACE_FORKLIFT = 'konveyor-forklift';
export const NAMESPACE_MIGRATION = 'konveyor-migration';

// start of the timeline for mock data
export const EPOCH = process.env.TEST_TIMELINE_START
  ? DateTime.fromISO(process.env.TEST_TIMELINE_START)
  : DateTime.now().minus({ days: 1 });

export const NOW = process.env.TEST_TIMELINE_NOW
  ? DateTime.fromISO(process.env.TEST_TIMELINE_NOW)
  : DateTime.now();

export const disks = ({
  providers,
  inventoryPath,
  ovirt,
  openstack,
}: {
  providers: InventoryByType;
  inventoryPath: string;
  ovirt: { [uid: string]: OVirtDisk[] };
  openstack: OpenstackVolumeType[];
}) => [
  ...providers.ovirt.map(({ selfLink, object }) => [
    `${inventoryPath}${selfLink}/disks`,
    ovirt[object.metadata.uid] ?? [],
  ]),
  ...providers.openstack.map(({ selfLink }) => [`${inventoryPath}${selfLink}/volumes`, openstack]),
];

export const vms = ({
  providers,
  inventoryPath,
  vsphere,
  ovirt,
}: {
  providers: InventoryByType;
  inventoryPath: string;
  vsphere: { [uid: string]: VSphereVM[] };
  ovirt: { [uid: string]: OVirtVM[] };
}) =>
  [
    ...providers.ovirt.map(({ selfLink, object }) => [selfLink, ovirt[object.metadata.uid] ?? []]),
    ...providers.vsphere.map(({ selfLink, object }) => [
      selfLink,
      vsphere[object.metadata.uid] ?? [],
    ]),
  ].map(([selfLink, mock]) => [`${inventoryPath}${selfLink}/vms`, mock]);

export const hosts = ({
  providers,
  inventoryPath,
  vsphere,
}: {
  providers: InventoryByType;
  inventoryPath: string;
  vsphere: { [uid: string]: VSphereHostInventory[] };
}) =>
  providers.vsphere.map(({ selfLink, object }) => [
    `${inventoryPath}${selfLink}/hosts`,
    vsphere[object.metadata.uid] ?? [],
  ]);

export const namespaces = ({
  providers,
  inventoryPath,
  openshift,
}: {
  providers: InventoryByType;
  inventoryPath: string;
  openshift: { [uid: string]: OpenShiftNamespace[] };
}) =>
  providers.openshift.map(({ selfLink, uid }) => [
    `${inventoryPath}${selfLink}/namespaces`,
    openshift[uid] ?? [],
  ]);

export const networks = ({
  providers,
  inventoryPath,
  vsphere,
  ovirt,
  openshift,
}: {
  providers: InventoryByType;
  inventoryPath: string;
  vsphere: { [uid: string]: VSphereNetwork[] };
  ovirt: { [uid: string]: OVirtNetwork[] };
  openshift: { [uid: string]: OpenShiftNetworkAttachmentDefinition[] };
}) => [
  ...[
    ...providers.vsphere.map(({ selfLink, object }) => [
      selfLink,
      vsphere[object.metadata.uid] ?? [],
    ]),
    ...providers.ovirt.map(({ selfLink, object }) => [selfLink, ovirt[object.metadata.uid] ?? []]),
  ].map(([selfLink, mock]) => [`${inventoryPath}${selfLink}/networks`, mock]),
  ...providers.openshift.map(({ selfLink, object }) => [
    `${inventoryPath}${selfLink}/networkattachmentdefinitions`,
    openshift[object.metadata.uid] ?? [],
  ]),
];

export const nicProfiles = ({
  providers,
  inventoryPath,
  ovirt,
}: {
  providers: InventoryByType;
  inventoryPath: string;
  ovirt: { [uid: string]: OVirtNicProfile[] };
}) =>
  providers.ovirt.map(({ selfLink, object }) => [
    `${inventoryPath}${selfLink}/nicprofiles`,
    ovirt[object.metadata.uid] ?? [],
  ]);

export const storages = ({
  providers,
  inventoryPath,
  vsphere,
  ovirt,
  openstack,
  openshift,
}: {
  providers: InventoryByType;
  inventoryPath: string;
  vsphere: { [uid: string]: VSphereDataStore[] };
  ovirt: { [uid: string]: OVirtStorageDomain[] };
  openstack: { [uid: string]: OpenstackVolumeType[] };
  openshift: { [uid: string]: OpenShiftStorageClass[] };
}) => [
  ...providers.ovirt.map(({ selfLink, object }) => [
    `${inventoryPath}${selfLink}/storagedomains`,
    ovirt[object.metadata.uid] ?? [],
  ]),
  ...providers.openstack.map(({ selfLink, object }) => [
    `${inventoryPath}${selfLink}/volumetypes`,
    openstack[object.metadata.uid] ?? [],
  ]),
  ...providers.vsphere.map(({ selfLink, object }) => [
    `${inventoryPath}${selfLink}/datastores`,
    vsphere[object.metadata.uid] ?? [],
  ]),
  ...providers.openshift.map(({ selfLink, object }) => [
    `${inventoryPath}${selfLink}/storageclasses`,
    openshift[object.metadata.uid] ?? [],
  ]),
];

export const trees = ({
  providers,
  inventoryPath,
  vsphere: { hostTree: vsphereHostTree, vmTree: vsphereVmTree },
  ovirt,
  openstack,
}: {
  providers: InventoryByType;
  inventoryPath: string;
  vsphere: {
    hostTree: { [uid: string]: VSphereTreeNode };
    vmTree: { [uid: string]: VSphereTreeNode };
  };
  ovirt: { [uid: string]: OvirtTreeNode };
  openstack: { [uid: string]: OpenstackTreeNode };
}) => [
  ...providers.vsphere.map(({ selfLink, object }) => [
    `${inventoryPath}${selfLink}/tree/host`,
    vsphereHostTree[object.metadata.uid] ?? [],
  ]),
  ...providers.vsphere.map(({ selfLink, object }) => [
    `${inventoryPath}${selfLink}/tree/vm`,
    vsphereVmTree[object.metadata.uid] ?? [],
  ]),
  ...providers.ovirt.map(({ selfLink, object }) => [
    `${inventoryPath}${selfLink}/tree/cluster`,
    ovirt[object.metadata.uid] ?? [],
  ]),
  ...providers.openstack.map(({ selfLink, object }) => [
    `${inventoryPath}${selfLink}/tree/project`,
    openstack[object.metadata.uid] ?? [],
  ]),
];

export const forNamespace = ({
  resources,
  name,
  namespace,
  namespacePath,
}: {
  resources: Array<{ metadata?: { namespace?: string } }>;
  name: string;
  namespace: string;
  namespacePath: string;
}): [string, Array<{ metadata?: { namespace?: string } }>] => [
  `${namespacePath}${namespace}/${name}`,
  resources.filter((it) => it?.metadata?.namespace === namespace),
];

export const forAllNamespaces = ({
  resources,
  name,
  allNamespacesPath,
}: {
  resources: Array<{ metadata?: { namespace?: string } }>;
  name: string;
  allNamespacesPath: string;
}): [string, Array<{ metadata?: { namespace?: string } }>] => [
  `${allNamespacesPath}${name}`,
  resources,
];

export const toPath = ({
  resources,
  name,
  namespaces,
  allNamespacesPath,
  namespacePath,
  apiVersion = ForkliftControllerModelGroupVersionKind.version,
}: {
  resources: Array<{ metadata?: { namespace?: string } }>;
  name: string;
  namespaces: string[];
  allNamespacesPath: string;
  namespacePath: string;
  apiVersion?: string;
}): Array<[string, unknown]> =>
  [
    forAllNamespaces({
      resources,
      name,
      allNamespacesPath,
    }),
    ...namespaces.map((namespace) => forNamespace({ resources, name, namespace, namespacePath })),
  ].map(([path, items]) => [
    path,
    {
      apiVersion,
      kind: name,
      metadata: {
        continue: '',
        resourceVersion: '',
        selfLink: '',
      },
      items,
    },
  ]);

export const nameAndNamespace = (
  ref: IoK8sApimachineryPkgApisMetaV1ObjectMeta,
): { name: string; namespace: string } => ({
  name: ref?.name || '',
  namespace: ref?.namespace || '',
});

export const toId = ({
  object: { metadata: { name = '', namespace = '', generation = 1, uid = '' } = {} },
}: {
  object: V1beta1Provider;
}): {
  name: string;
  namespace: string;
  generation: number;
  uid: string;
} => ({
  name,
  namespace,
  generation,
  uid,
});

export const getObjectRef = ({
  apiVersion,
  kind,
  metadata: { name, namespace, uid },
}: V1beta1Provider): V1beta1PlanSpecProviderDestination | V1beta1PlanSpecProviderSource => ({
  apiVersion,
  kind,
  name,
  namespace,
  uid,
});

/* eslint-disable @cspell/spellchecker */
import { DateTime } from 'luxon';

import {
  ForkliftControllerModelGroupVersionKind,
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
  ProvidersInventoryList,
  V1beta1Provider,
  VSphereDataStore,
  VSphereHost,
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
  providers: ProvidersInventoryList;
  inventoryPath: string;
  ovirt: { [uid: string]: OVirtDisk[] };
  openstack: OpenstackVolumeType[];
}) => [
  ...providers.ovirt.map(({ selfLink, uid }) => [
    `${inventoryPath}${selfLink}/disks`,
    ovirt[uid] ?? [],
  ]),
  ...providers.openstack.map(({ selfLink }) => [`${inventoryPath}${selfLink}/volumes`, openstack]),
];

export const vms = ({
  providers,
  inventoryPath,
  vsphere,
  ovirt,
}: {
  providers: ProvidersInventoryList;
  inventoryPath: string;
  vsphere: { [uid: string]: VSphereVM[] };
  ovirt: { [uid: string]: OVirtVM[] };
}) =>
  [
    ...providers.ovirt.map(({ selfLink, uid }) => [selfLink, ovirt[uid] ?? []]),
    ...providers.vsphere.map(({ selfLink, uid }) => [selfLink, vsphere[uid] ?? []]),
  ].map(([selfLink, mock]) => [`${inventoryPath}${selfLink}/vms`, mock]);

export const hosts = ({
  providers,
  inventoryPath,
  vsphere,
}: {
  providers: ProvidersInventoryList;
  inventoryPath: string;
  vsphere: { [uid: string]: VSphereHost[] };
}) =>
  providers.vsphere.map(({ selfLink, uid }) => [
    `${inventoryPath}${selfLink}/hosts`,
    vsphere[uid] ?? [],
  ]);

export const namespaces = ({
  providers,
  inventoryPath,
  openshift,
}: {
  providers: ProvidersInventoryList;
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
  providers: ProvidersInventoryList;
  inventoryPath: string;
  vsphere: { [uid: string]: VSphereNetwork[] };
  ovirt: { [uid: string]: OVirtNetwork[] };
  openshift: { [uid: string]: OpenShiftNetworkAttachmentDefinition[] };
}) => [
  ...[
    ...providers.vsphere.map(({ selfLink, uid }) => [selfLink, vsphere[uid] ?? []]),
    ...providers.ovirt.map(({ selfLink, uid }) => [selfLink, ovirt[uid] ?? []]),
  ].map(([selfLink, mock]) => [`${inventoryPath}${selfLink}/networks`, mock]),
  ...providers.openshift.map(({ selfLink, uid }) => [
    `${inventoryPath}${selfLink}/networkattachmentdefinitions`,
    openshift[uid] ?? [],
  ]),
];

export const nicProfiles = ({
  providers,
  inventoryPath,
  ovirt,
}: {
  providers: ProvidersInventoryList;
  inventoryPath: string;
  ovirt: { [uid: string]: OVirtNicProfile[] };
}) =>
  providers.ovirt.map(({ selfLink, uid }) => [
    `${inventoryPath}${selfLink}/nicprofiles`,
    ovirt[uid] ?? [],
  ]);

export const storages = ({
  providers,
  inventoryPath,
  vsphere,
  ovirt,
  openstack,
  openshift,
}: {
  providers: ProvidersInventoryList;
  inventoryPath: string;
  vsphere: { [uid: string]: VSphereDataStore[] };
  ovirt: { [uid: string]: OVirtStorageDomain[] };
  openstack: { [uid: string]: OpenstackVolumeType[] };
  openshift: { [uid: string]: OpenShiftStorageClass[] };
}) => [
  ...providers.ovirt.map(({ selfLink, uid }) => [
    `${inventoryPath}${selfLink}/storagedomains`,
    ovirt[uid] ?? [],
  ]),
  ...providers.openstack.map(({ selfLink, uid }) => [
    `${inventoryPath}${selfLink}/volumetypes`,
    openstack[uid] ?? [],
  ]),
  ...providers.vsphere.map(({ selfLink, uid }) => [
    `${inventoryPath}${selfLink}/datastores`,
    vsphere[uid] ?? [],
  ]),
  ...providers.openshift.map(({ selfLink, uid }) => [
    `${inventoryPath}${selfLink}/storageclasses`,
    openshift[uid] ?? [],
  ]),
];

export const trees = ({
  providers,
  inventoryPath,
  vsphere: { hostTree: vsphereHostTree, vmTree: vsphereVmTree },
  ovirt,
  openstack,
}: {
  providers: ProvidersInventoryList;
  inventoryPath: string;
  vsphere: {
    hostTree: { [uid: string]: VSphereTreeNode };
    vmTree: { [uid: string]: VSphereTreeNode };
  };
  ovirt: { [uid: string]: OvirtTreeNode };
  openstack: { [uid: string]: OpenstackTreeNode };
}) => [
  ...providers.vsphere.map(({ selfLink, uid }) => [
    `${inventoryPath}${selfLink}/tree/host`,
    vsphereHostTree[uid] ?? [],
  ]),
  ...providers.vsphere.map(({ selfLink, uid }) => [
    `${inventoryPath}${selfLink}/tree/vm`,
    vsphereVmTree[uid] ?? [],
  ]),
  ...providers.ovirt.map(({ selfLink, uid }) => [
    `${inventoryPath}${selfLink}/tree/cluster`,
    ovirt[uid] ?? [],
  ]),
  ...providers.openstack.map(({ selfLink, uid }) => [
    `${inventoryPath}${selfLink}/tree/project`,
    openstack[uid] ?? [],
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

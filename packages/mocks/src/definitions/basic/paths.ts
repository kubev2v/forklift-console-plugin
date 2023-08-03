import { V1Secret } from '@kubev2v/types';

import {
  disks,
  hosts,
  NAMESPACE_FORKLIFT,
  NAMESPACE_MIGRATION,
  namespaces,
  networks,
  nicProfiles,
  storages,
  toPath,
  trees,
  vms,
} from '../utils';

import { MOCK_DISKS } from './disks.mock';
import { MOCK_HOOKS } from './hooks.mock';
import { MOCK_HOST_CONFIGS, MOCK_HOSTS } from './hosts.mock';
import { MOCK_NETWORK_MAPPINGS, MOCK_STORAGE_MAPPINGS } from './mappings.mock';
import { MOCK_MIGRATIONS } from './migrations.mock';
import { MOCK_MUST_GATHERS } from './mustGather.mock';
import { MOCK_OPENSHIFT_NAMESPACES } from './namespaces.mock';
import { MOCK_OPENSHIFT_NETWORKS, MOCK_RHV_NETWORKS, MOCK_VMWARE_NETWORKS } from './networks.mock';
import { MOCK_NIC_PROFILES } from './nicProfiles.mock';
import { MOCK_PLANS } from './plans.mock';
import { MOCK_CLUSTER_PROVIDERS, MOCK_INVENTORY_PROVIDERS } from './providers.mock';
import { secretInsecure, secretSecure } from './secrets.mock';
import {
  MOCK_OPENSHIFT_STORAGE_CLASS,
  MOCK_OPENSTACK_VOLUME_TYPES,
  MOCK_RHV_STORAGE_DOMAINS,
  MOCK_VMWARE_DATASTORES,
} from './storages.mock';
import {
  MOCK_OPENSTACK_HOST_TREE,
  MOCK_RHV_HOST_TREE,
  MOCK_VMWARE_HOST_TREE,
  MOCK_VMWARE_VM_TREE,
} from './tree.mock';
import { MOCK_RHV_VMS, MOCK_VMWARE_VMS } from './vms.mock';

const INVENTORY_PATH = '/api/proxy/plugin/forklift-console-plugin/forklift-inventory/';
const ALL_NAMESPACES_PATH = '/api/kubernetes/apis/forklift.konveyor.io/v1beta1/';
const NAMESPACE_PATH = '/api/kubernetes/apis/forklift.konveyor.io/v1beta1/namespaces/';
const NAMESPACES = [NAMESPACE_FORKLIFT, NAMESPACE_MIGRATION];

const k8s = {
  providers: MOCK_CLUSTER_PROVIDERS,
  networkmaps: MOCK_NETWORK_MAPPINGS,
  storagemaps: MOCK_STORAGE_MAPPINGS,
  plans: MOCK_PLANS,
  migrations: MOCK_MIGRATIONS,
  hosts: MOCK_HOST_CONFIGS,
  hooks: MOCK_HOOKS,
};

const paths = [
  [
    '/api/proxy/plugin/forklift-console-plugin/forklift-inventory/providers',
    MOCK_INVENTORY_PROVIDERS,
  ],
  ...Object.values(MOCK_INVENTORY_PROVIDERS).flatMap((providers: { selfLink: string }[]) =>
    providers.map((it) => [`${INVENTORY_PATH}${it.selfLink}`, it]),
  ),
  [
    '/api/proxy/plugin/forklift-console-plugin/forklift-must-gather-api/must-gather',
    MOCK_MUST_GATHERS,
  ],
  [
    '/api/proxy/plugin/forklift-console-plugin/forklift-must-gather-api/must-gather/plan::',
    MOCK_MUST_GATHERS[0],
  ],
  ...NAMESPACES.flatMap((namespace): [string, string, (n: string) => V1Secret][] => [
    [namespace, 'mock-insecure', secretInsecure],
    [namespace, 'mock-secure', secretSecure],
  ]).map(([namespace, secretName, createSecret]) => [
    `/api/kubernetes/api/v1/namespaces/${namespace}/secrets/${secretName}`,
    createSecret(namespace),
  ]),
  ...disks({
    providers: MOCK_INVENTORY_PROVIDERS,
    inventoryPath: INVENTORY_PATH,
    openstack: [],
    ovirt: MOCK_DISKS,
  }),
  ...vms({
    providers: MOCK_INVENTORY_PROVIDERS,
    inventoryPath: INVENTORY_PATH,
    ovirt: MOCK_RHV_VMS,
    vsphere: MOCK_VMWARE_VMS,
  }),
  ...hosts({
    providers: MOCK_INVENTORY_PROVIDERS,
    inventoryPath: INVENTORY_PATH,
    vsphere: MOCK_HOSTS,
  }),
  ...namespaces({
    providers: MOCK_INVENTORY_PROVIDERS,
    inventoryPath: INVENTORY_PATH,
    openshift: MOCK_OPENSHIFT_NAMESPACES,
  }),
  ...networks({
    providers: MOCK_INVENTORY_PROVIDERS,
    inventoryPath: INVENTORY_PATH,
    openshift: MOCK_OPENSHIFT_NETWORKS,
    ovirt: MOCK_RHV_NETWORKS,
    vsphere: MOCK_VMWARE_NETWORKS,
  }),
  ...nicProfiles({
    providers: MOCK_INVENTORY_PROVIDERS,
    inventoryPath: INVENTORY_PATH,
    ovirt: MOCK_NIC_PROFILES,
  }),
  ...storages({
    providers: MOCK_INVENTORY_PROVIDERS,
    inventoryPath: INVENTORY_PATH,
    openstack: MOCK_OPENSTACK_VOLUME_TYPES,
    ovirt: MOCK_RHV_STORAGE_DOMAINS,
    vsphere: MOCK_VMWARE_DATASTORES,
    openshift: MOCK_OPENSHIFT_STORAGE_CLASS,
  }),
  ...trees({
    providers: MOCK_INVENTORY_PROVIDERS,
    inventoryPath: INVENTORY_PATH,
    ovirt: MOCK_RHV_HOST_TREE,
    openstack: MOCK_OPENSTACK_HOST_TREE,
    vsphere: {
      hostTree: MOCK_VMWARE_HOST_TREE,
      vmTree: MOCK_VMWARE_VM_TREE,
    },
  }),
  ...Object.entries(k8s).flatMap(([kind, data]) => [
    ...toPath({
      resources: data,
      name: kind,
      namespaces: NAMESPACES,
      allNamespacesPath: ALL_NAMESPACES_PATH,
      namespacePath: NAMESPACE_PATH,
    }),
    ...data.map((it) => [
      `${NAMESPACE_PATH}${it.metadata.namespace}/${kind}/${it.metadata.name}`,
      it,
    ]),
  ]),
];

export default Object.fromEntries(paths);

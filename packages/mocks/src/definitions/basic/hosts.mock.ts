import { HostModelGroupVersionKind as gvk, V1beta1Host, VSphereHost } from '@kubev2v/types';

import { EPOCH, nameAndNamespace, NAMESPACE_FORKLIFT, NAMESPACE_MIGRATION } from '../utils';

import {
  VMWARE_01_UID,
  VMWARE_02_UID,
  VMWARE_03_UID,
  vmwareProvider1,
  vmwareProvider3,
  VmwareProviderIDs,
} from './providers.mock';

export const HOST_01_ID = 'host-44';
const host1: VSphereHost = {
  id: HOST_01_ID,
  name: 'esx12.v2v.example.com',
  selfLink: `providers/vsphere/${VMWARE_01_UID}/hosts/${HOST_01_ID}`,
  managementServerIp: '10.19.2.10',
  parent: {
    kind: 'parent-test-kind',
    id: 'parent-id',
  },
  path: '/',
  cluster: 'test-cluster',
  cpuCores: 5,
  cpuSockets: 5,
  inMaintenance: false,
  networking: {},
  productName: 'test-product',
  productVersion: '0.0.0-test',
  revision: 1,
  status: 'test-status',
  thumbprint: 'test-thumbprint',
  timezone: 'UTC',
  datastores: null,
  networks: null,
  networkAdapters: [
    {
      name: 'VM_Migration',
      ipAddress: '192.168.79.12',
      linkSpeed: 10000,
      mtu: 9000,
      subnetMask: '255.255.255.0',
    },
    {
      name: 'VMkernel',
      ipAddress: '172.31.2.12',
      linkSpeed: 10000,
      mtu: 1500,
      subnetMask: '255.255.255.0',
    },
    {
      name: 'vDS-1',
      ipAddress: '192.168.61.12',
      linkSpeed: 10000,
      mtu: 1500,
      subnetMask: '255.255.255.0',
    },
    {
      name: 'Management Network',
      ipAddress: '10.19.2.12',
      linkSpeed: 1000,
      mtu: 1500,
      subnetMask: '255.255.255.0',
    },
  ],
};

export const HOST_02_ID = 'host-29';
const host2: VSphereHost = {
  ...host1,
  id: HOST_02_ID,
  name: 'esx13.v2v.example.com',
  selfLink: `providers/vsphere/${VMWARE_01_UID}/hosts/${HOST_02_ID}`,
};

export const HOST_03_ID = 'host-57';
const host3: VSphereHost = {
  ...host1,
  id: 'host-57',
  name: 'esx14.v2v.bos.redhat.com',
  selfLink: `providers/vsphere/${VMWARE_03_UID}/hosts/${HOST_03_ID}`,
};

export const MOCK_HOSTS: { [uid in VmwareProviderIDs]: VSphereHost[] } = {
  [VMWARE_01_UID]: [host1, host2],
  [VMWARE_02_UID]: [],
  [VMWARE_03_UID]: [host3],
};

export const MOCK_HOST_CONFIGS: V1beta1Host[] = [
  {
    apiVersion: `${gvk.group}/${gvk.version}`,
    kind: 'Host',
    metadata: {
      name: `host-${HOST_01_ID}-config`,
      namespace: NAMESPACE_MIGRATION,
    },
    spec: {
      id: HOST_01_ID,
      ipAddress: host1.networkAdapters[0].ipAddress,
      provider: nameAndNamespace(vmwareProvider1),
      secret: {
        name: 'mock-secret',
        namespace: NAMESPACE_MIGRATION,
      },
    },
  },
  {
    apiVersion: `${gvk.group}/${gvk.version}`,
    kind: 'Host',
    metadata: {
      name: `host-${HOST_03_ID}-config`,
      namespace: NAMESPACE_FORKLIFT,
    },
    spec: {
      id: HOST_03_ID,
      ipAddress: host3.networkAdapters[0].ipAddress,
      provider: nameAndNamespace(vmwareProvider3),
      secret: {
        name: 'mock-secret',
        namespace: NAMESPACE_FORKLIFT,
      },
    },
    status: {
      conditions: [
        {
          category: 'Critical',
          lastTransitionTime: EPOCH.toISO(),
          message: 'Invalid credentials',
          reason: 'MockReason',
          status: 'True',
          type: 'MockType',
        },
      ],
    },
  },
];

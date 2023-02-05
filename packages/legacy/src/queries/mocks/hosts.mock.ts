import { CLUSTER_API_VERSION, ENV } from 'legacy/src/common/constants';
import { nameAndNamespace } from '../helpers';
import { IHost, IHostConfig } from '../types/hosts.types';
import { MOCK_INVENTORY_PROVIDERS } from './providers.mock';

export let MOCK_HOSTS: IHost[] = [];
export let MOCK_HOST_CONFIGS: IHostConfig[] = [];

if (process.env.NODE_ENV === 'test' || process.env.DATA_SOURCE === 'mock') {
  const host1: IHost = {
    id: 'host-44',
    name: 'esx12.v2v.bos.redhat.com',
    selfLink: '/providers/vsphere/test/hosts/host-44',
    managementServerIp: '10.19.2.10',
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

  const host2 = {
    ...host1,
    id: 'host-29',
    name: 'esx13.v2v.bos.redhat.com',
    selfLink: '/providers/vsphere/test/hosts/host-29',
  };

  const host3 = {
    ...host1,
    id: 'host-57',
    name: 'esx14.v2v.bos.redhat.com',
    selfLink: '/providers/vsphere/test/hosts/host-57',
  };

  MOCK_HOSTS = [host1, host2, host3];

  MOCK_HOST_CONFIGS = [
    {
      apiVersion: CLUSTER_API_VERSION,
      kind: 'Host',
      metadata: {
        name: `host-${host1.id}-config`,
        namespace: ENV.NAMESPACE,
      },
      spec: {
        id: host1.id,
        ipAddress: host1.networkAdapters[0].ipAddress,
        provider: nameAndNamespace(MOCK_INVENTORY_PROVIDERS.vsphere[0]),
        secret: {
          name: 'mock-secret',
          namespace: 'openshift-migration',
        },
      },
    },
    {
      apiVersion: CLUSTER_API_VERSION,
      kind: 'Host',
      metadata: {
        name: `host-${host3.id}-config`,
        namespace: ENV.NAMESPACE,
      },
      spec: {
        id: host3.id,
        ipAddress: host3.networkAdapters[0].ipAddress,
        provider: nameAndNamespace(MOCK_INVENTORY_PROVIDERS.vsphere[0]),
        secret: {
          name: 'mock-secret',
          namespace: 'openshift-migration',
        },
      },
      status: {
        conditions: [
          {
            category: 'Critical',
            lastTransitionTime: '2020-09-18T16:04:10Z',
            message: 'Invalid credentials',
            reason: 'MockReason',
            status: 'True',
            type: 'MockType',
          },
        ],
      },
    },
  ];
}

import { ProviderType } from '../types/enums';
import { MTV_NAMESPACE } from '../utils/resource-manager/constants';

// Test Data Constants
export const TEST_DATA = {
  // Storage Data
  datastores: [
    {
      id: 'test-datastore-1',
      name: 'test-datastore-1',
      path: '/test/datastore/test-datastore-1',
    },
    {
      id: 'test-datastore-2',
      name: 'test-datastore-2',
      path: '/test/datastore/test-datastore-2',
    },
  ],
  // Folder Data
  folders: [
    {
      children: 0,
      datacenter: 'test-datacenter-1',
      id: 'test-folder-1',
      name: 'Test Folder 1',
    },
    {
      children: 0,
      datacenter: 'test-datacenter-1',
      id: 'test-folder-2',
      name: 'Test Folder 2',
    },
  ],
  // Host Data
  hosts: [
    {
      cluster: 'test-cluster-1',
      cpuCores: 16,
      cpuSockets: 1,
      id: 'test-host-1',
      name: 'test-host-1.example.com',
      productName: 'VMware ESXi',
      productVersion: '7.0.0',
      status: 'green',
      totalMemory: 274877906944,
    },
    {
      cluster: 'test-cluster-1',
      cpuCores: 16,
      cpuSockets: 1,
      id: 'test-host-2',
      name: 'test-host-2.example.com',
      productName: 'VMware ESXi',
      productVersion: '7.0.0',
      status: 'green',
      totalMemory: 274877906944,
    },
  ],
  networkMap: 'test-network-map-1',
  // Network Data
  networks: [
    {
      name: 'test-vm-network',
      type: 'DistributedVirtualPortgroup',
      uid: 'test-network-1-uid',
      vlan: 100,
    },
    {
      name: 'test-mgmt-network',
      type: 'DistributedVirtualPortgroup',
      uid: 'test-network-2-uid',
      vlan: 200,
    },
  ],
  // Plan Creation Data
  planName: 'test-create-plan',
  planProject: MTV_NAMESPACE,

  // Projects/Namespaces
  projects: [
    {
      name: MTV_NAMESPACE,
      phase: 'Active',
      uid: `${MTV_NAMESPACE}-uid`,
    },
    {
      name: 'test-target-project',
      phase: 'Active',
      uid: 'test-target-project-uid',
    },
  ],

  // Provider Data
  providers: {
    source: {
      name: 'test-source-provider',
      type: ProviderType.VSPHERE,
      uid: 'test-source-uid-1',
      url: 'https://test-vcenter.example.com',
    },
    target: {
      name: 'test-target-provider',
      type: 'openshift',
      uid: 'test-target-uid-1',
      url: '',
    },
  },

  sourceProvider: 'test-source-provider',

  // Storage Classes
  storageClasses: [
    {
      allowVolumeExpansion: true,
      name: 'test-ceph-rbd',
      provisioner: 'test.csi.ceph.com',
      reclaimPolicy: 'Delete',
      uid: 'test-storage-class-1-uid',
    },
    {
      allowVolumeExpansion: true,
      name: 'test-cephfs',
      provisioner: 'test.csi.cephfs.com',
      reclaimPolicy: 'Delete',
      uid: 'test-storage-class-2-uid',
    },
  ],

  storageMap: 'test-storage-map-1',

  targetProject: 'test-target-project',

  targetProvider: 'test-target-provider',

  // Virtual Machine Data
  virtualMachines: [
    {
      cluster: 'test-cluster-1',
      cpuCores: 2,
      cpuSockets: 2,
      host: 'test-host-1',
      id: 'test-vm-1',
      memory: 4294967296,
      name: 'test-virtual-machine-1',
      osType: 'linux',
      status: 'down',
    },
  ],
};

// API Endpoints Constants
export const API_ENDPOINTS = {
  allPlans: '/api/kubernetes/apis/forklift.konveyor.io/v1beta1/plans?limit=250',
  allProviders: '/api/kubernetes/apis/forklift.konveyor.io/v1beta1/providers?limit=250',
  datastores: (providerType: string, uid: string) =>
    `**/forklift-inventory/providers/${providerType}/${uid}/datastores?detail=1`,
  folders: (providerType: string, uid: string) =>
    `**/forklift-inventory/providers/${providerType}/${uid}/folders?detail=4`,
  hosts: (providerType: string, uid: string) =>
    `**/forklift-inventory/providers/${providerType}/${uid}/hosts?detail=4`,
  namespaces: '/api/kubernetes/api/v1/namespaces?limit=250',
  networkMaps: `**/apis/forklift.konveyor.io/v1beta1/namespaces/${MTV_NAMESPACE}/networkmaps?limit=250`,
  networks: (providerType: string, uid: string) =>
    `**/forklift-inventory/providers/${providerType}/${uid}/networks`,
  plans: '/api/kubernetes/apis/forklift.konveyor.io/v1beta1/namespaces/*/plans?limit=250',
  projects: '/api/kubernetes/apis/project.openshift.io/v1/projects?limit=250',
  providers: `/api/kubernetes/apis/forklift.konveyor.io/v1beta1/namespaces/${MTV_NAMESPACE}/providers?limit=250`,
  storageClasses: (uid: string) =>
    `**/forklift-inventory/providers/openshift/${uid}/storageclasses?detail=1`,
  storageMaps: `**/apis/forklift.konveyor.io/v1beta1/namespaces/${MTV_NAMESPACE}/storagemaps?limit=250`,
  targetNamespaces: (uid: string) => `**/forklift-inventory/providers/openshift/${uid}/namespaces`,
  virtualMachines: (providerType: string, uid: string) =>
    `**/forklift-inventory/providers/${providerType}/${uid}/vms?detail=4`,
};

// Helper function to get test data by category
export const getTestData = (category: keyof typeof TEST_DATA) => {
  return TEST_DATA[category];
};

// Helper function to create plan with test data
export const createTestPlan = (overrides: Partial<typeof TEST_DATA> = {}) => {
  return { ...TEST_DATA, ...overrides };
};

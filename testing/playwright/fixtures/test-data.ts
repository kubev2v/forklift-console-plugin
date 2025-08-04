// Test Data Constants
export const TEST_DATA = {
  // Plan Creation Data
  planName: 'test-create-plan',
  planProject: 'openshift-mtv',
  sourceProvider: 'test-source-provider',
  targetProvider: 'test-target-provider',
  targetProject: 'test-target-project',
  networkMap: 'test-network-map-1',
  storageMap: 'test-storage-map-1',

  // Provider Data
  providers: {
    source: {
      name: 'test-source-provider',
      uid: 'test-source-uid-1',
      type: 'vsphere',
      url: 'https://test-vcenter.example.com',
    },
    target: {
      name: 'test-target-provider',
      uid: 'test-target-uid-1',
      type: 'openshift',
      url: '',
    },
  },

  // Virtual Machine Data
  virtualMachines: [
    {
      id: 'test-vm-1',
      name: 'test-virtual-machine-1',
      status: 'down',
      cluster: 'test-cluster-1',
      host: 'test-host-1',
      cpuSockets: 2,
      cpuCores: 2,
      memory: 4294967296,
      osType: 'linux',
    },
  ],

  // Network Data
  networks: [
    {
      uid: 'test-network-1-uid',
      name: 'test-vm-network',
      type: 'DistributedVirtualPortgroup',
      vlan: 100,
    },
    {
      uid: 'test-network-2-uid',
      name: 'test-mgmt-network',
      type: 'DistributedVirtualPortgroup',
      vlan: 200,
    },
  ],

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

  // Storage Classes
  storageClasses: [
    {
      uid: 'test-storage-class-1-uid',
      name: 'test-ceph-rbd',
      provisioner: 'test.csi.ceph.com',
      reclaimPolicy: 'Delete',
      allowVolumeExpansion: true,
    },
  ],

  // Projects/Namespaces
  projects: [
    {
      name: 'openshift-mtv',
      uid: 'openshift-mtv-uid',
      phase: 'Active',
    },
    {
      name: 'test-target-project',
      uid: 'test-target-project-uid',
      phase: 'Active',
    },
  ],

  // Host Data
  hosts: [
    {
      id: 'test-host-1',
      name: 'test-host-1.example.com',
      cluster: 'test-cluster-1',
      status: 'green',
      cpuSockets: 1,
      cpuCores: 16,
      totalMemory: 274877906944,
      productName: 'VMware ESXi',
      productVersion: '7.0.0',
    },
  ],

  // Folder Data
  folders: [
    {
      id: 'test-folder-1',
      name: 'Test Folder 1',
      datacenter: 'test-datacenter-1',
      children: 0,
    },
    {
      id: 'test-folder-2',
      name: 'Test Folder 2',
      datacenter: 'test-datacenter-1',
      children: 0,
    },
  ],
};

// API Endpoints Constants
export const API_ENDPOINTS = {
  plans: '/api/kubernetes/apis/forklift.konveyor.io/v1beta1/namespaces/*/plans?limit=250',
  allPlans: '/api/kubernetes/apis/forklift.konveyor.io/v1beta1/plans?limit=250',
  providers:
    '/api/kubernetes/apis/forklift.konveyor.io/v1beta1/namespaces/openshift-mtv/providers?limit=250',
  allProviders: '/api/kubernetes/apis/forklift.konveyor.io/v1beta1/providers?limit=250',
  projects: '/api/kubernetes/apis/project.openshift.io/v1/projects?limit=250',
  namespaces: '/api/kubernetes/api/v1/namespaces?limit=250',
  networkMaps:
    '**/apis/forklift.konveyor.io/v1beta1/namespaces/openshift-mtv/networkmaps?limit=250',
  storageMaps:
    '**/apis/forklift.konveyor.io/v1beta1/namespaces/openshift-mtv/storagemaps?limit=250',
  virtualMachines: (providerType: string, uid: string) =>
    `**/forklift-inventory/providers/${providerType}/${uid}/vms?detail=4`,
  networks: (providerType: string, uid: string) =>
    `**/forklift-inventory/providers/${providerType}/${uid}/networks`,
  datastores: (providerType: string, uid: string) =>
    `**/forklift-inventory/providers/${providerType}/${uid}/datastores`,
  hosts: (providerType: string, uid: string) =>
    `**/forklift-inventory/providers/${providerType}/${uid}/hosts?detail=4`,
  folders: (providerType: string, uid: string) =>
    `**/forklift-inventory/providers/${providerType}/${uid}/folders?detail=4`,
  storageClasses: (uid: string) =>
    `**/forklift-inventory/providers/openshift/${uid}/storageclasses?detail=1`,
  targetNamespaces: (uid: string) => `**/forklift-inventory/providers/openshift/${uid}/namespaces`,
};

// Helper function to get test data by category
export const getTestData = (category: keyof typeof TEST_DATA) => {
  return TEST_DATA[category];
};

// Helper function to create plan with test data
export const createTestPlan = (overrides: Partial<typeof TEST_DATA> = {}) => {
  return { ...TEST_DATA, ...overrides };
};

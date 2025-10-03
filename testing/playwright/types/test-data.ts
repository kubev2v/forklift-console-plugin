export interface TargetProject {
  name: string;
  isPreexisting: boolean;
}

export interface NetworkMap {
  name: string;
  isPreexisting: boolean;
}

export interface StorageMap {
  name: string;
  isPreexisting: boolean;
  targetStorage?: string; // Target storage class (e.g., 'ocs-storagecluster-ceph-rbd-virtualization')
}

export interface VirtualMachine {
  sourceName: string;
  targetName?: string; // If null or different from sourceName, will be used for renaming
}

/**
 * Common storage classes available in the cluster
 */
export const StorageClasses = {
  OCS_RBD_VIRTUALIZATION: 'ocs-storagecluster-ceph-rbd-virtualization',
  OCS_RBD: 'ocs-storagecluster-ceph-rbd',
  OCS_CEPHFS: 'ocs-storagecluster-cephfs',
  HOSTPATH_BASIC: 'hostpath-csi-basic',
  STANDARD_CSI: 'standard-csi',
} as const;

export interface PlanTestData {
  planName: string;
  planProject: string;
  sourceProvider: string;
  targetProvider: string;
  targetProject: TargetProject;
  networkMap: NetworkMap;
  storageMap: StorageMap;
  virtualMachines?: VirtualMachine[];
  additionalPlanSettings?: {
    targetPowerState: 'on' | 'off' | 'auto';
  };
}

/**
 * Helper to create plan test data with proper typing
 */
export const createPlanTestData = (
  overrides: Partial<PlanTestData> & { sourceProvider: string },
): PlanTestData => {
  const uniqueId = crypto.randomUUID();
  const planName = `test-plan-${uniqueId}`;

  const defaults: PlanTestData = {
    planName,
    planProject: 'openshift-mtv',
    sourceProvider: 'test-provider',
    targetProvider: 'host',
    targetProject: {
      name: `test-project-${uniqueId}`,
      isPreexisting: false,
    },
    networkMap: {
      name: `${planName}-network-map`,
      isPreexisting: false,
    },
    storageMap: {
      name: `${planName}-storage-map`,
      isPreexisting: false,
      targetStorage: 'ocs-storagecluster-ceph-rbd-virtualization',
    },
    virtualMachines: [{ sourceName: 'mtv-func-rhel9' }],
  };

  return {
    ...defaults,
    ...overrides,
    targetProject: { ...defaults.targetProject, ...overrides.targetProject },
    networkMap: { ...defaults.networkMap, ...overrides.networkMap },
    storageMap: { ...defaults.storageMap, ...overrides.storageMap },
  };
};

export interface ProviderConfig {
  type: 'vsphere' | 'ovirt' | 'ova' | 'openstack';
  endpoint_type?: 'vcenter' | 'esxi';
  api_url: string;
  username: string;
  password: string;
  vddk_init_image?: string;
}
export interface ProviderData {
  name: string;
  projectName: string;
  type: 'vsphere' | 'ovirt' | 'ova' | 'openstack';
  endpointType?: 'vcenter' | 'esxi';
  hostname: string;
  username: string;
  password?: string;
  fingerprint?: string;
  vddkInitImage?: string;
  useVddkAioOptimization?: boolean;
}

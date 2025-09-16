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
}

/**
 * Helper to create plan test data with proper typing
 */
export const createPlanTestData = (data: PlanTestData): PlanTestData => ({ ...data });

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
  type: 'vsphere' | 'ovirt' | 'ova' | 'openstack';
  endpointType?: 'vcenter' | 'esxi';
  hostname: string;
  username: string;
  password?: string;
  fingerprint?: string;
  vddkInitImage?: string;
  useVddkAioOptimization?: boolean;
}

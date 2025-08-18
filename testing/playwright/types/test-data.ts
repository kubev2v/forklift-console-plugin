export interface TargetProject {
  name: string;
  isPreexisting: boolean;
}

export interface NetworkMap {
  name: string;
  isPreExisting: boolean;
}

export interface StorageMap {
  name: string;
  isPreExisting: boolean;
}

export interface PlanTestData {
  planName: string;
  planProject: string;
  sourceProvider: string;
  targetProvider: string;
  targetProject: TargetProject;
  networkMap: NetworkMap;
  storageMap: StorageMap;
}

/**
 * Helper to create plan test data with proper typing
 */
export const createPlanTestData = (data: PlanTestData): PlanTestData => ({ ...data });

export interface ProviderConfig {
  type: 'vsphere' | 'ovirt' | 'ova' | 'openstack';
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
}

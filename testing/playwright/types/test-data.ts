export interface PlanTestData {
  planName: string;
  planProject: string;
  sourceProvider: string;
  targetProvider: string;
  targetProject: string;
  networkMap: {
    name: string;
    isPreExisting: boolean;
  };
  storageMap: {
    name: string;
    isPreExisting: boolean;
  };
}

/**
 * Helper to create plan test data with proper typing
 */
export const createPlanTestData = ({
  planName,
  planProject,
  sourceProvider,
  targetProvider,
  targetProject,
  networkMap,
  storageMap,
}: PlanTestData): PlanTestData => ({
  planName,
  planProject,
  sourceProvider,
  targetProvider,
  targetProject,
  networkMap,
  storageMap,
});

export interface ProviderConfig {
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

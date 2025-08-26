import type {
  V1beta1NetworkMap,
  V1beta1Plan,
  V1beta1ProviderSpec,
  V1beta1StorageMap,
} from '@kubev2v/types';

export interface TargetProject {
  name: string;
  isPreexisting: boolean;
}

export type TestNetworkMap = Pick<V1beta1NetworkMap, 'metadata' | 'spec'> & {
  name: string;
  isPreExisting: boolean;
};

export type TestStorageMap = Pick<V1beta1StorageMap, 'metadata' | 'spec'> & {
  name: string;
  isPreExisting: boolean;
};

export type TestPlan = Pick<V1beta1Plan, 'metadata' | 'spec'> & {
  planName: string;
  planProject: string;
  sourceProvider: string;
  targetProvider: string;
  targetProject: TargetProject;
  networkMap: TestNetworkMap;
  storageMap: TestStorageMap;
};

export type ProviderData = Pick<V1beta1ProviderSpec, 'url'> & {
  name: string;
  type: 'vsphere' | 'ovirt' | 'ova' | 'openstack';
  endpointType?: 'vcenter' | 'esxi';
  hostname: string;
  username: string;
  password?: string;
  fingerprint?: string;
  vddkInitImage?: string;
};

export type PlanTestData = Pick<V1beta1Plan, 'metadata'> & {
  planName: string;
  planProject: string;
  sourceProvider: string;
  targetProvider: string;
  targetProject: TargetProject;
  networkMap: TestNetworkMap;
  storageMap: TestStorageMap;
};

/**
 * Helper to create plan test data with proper typing
 */
export const createPlanTestData = (data: PlanTestData): PlanTestData => ({ ...data });

// used for .provider.json file deserialization
export interface ProviderConfig {
  type: 'vsphere' | 'ovirt' | 'ova' | 'openstack';
  api_url: string;
  endpoint_type?: 'vcenter' | 'esxi';
  username: string;
  password: string;
  vddk_init_image?: string;
}

// Legacy aliases for backward compatibility
export type NetworkMap = TestNetworkMap;
export type StorageMap = TestStorageMap;

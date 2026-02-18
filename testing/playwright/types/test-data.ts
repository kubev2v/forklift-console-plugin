import { MTV_NAMESPACE } from '../utils/resource-manager/constants';
import { V2_11_0 } from '../utils/version/constants';
import { isVersionAtLeast } from '../utils/version/version';

import type { EndpointType, MigrationType, ProviderType } from './enums';

export interface TargetProject {
  name: string;
  isPreexisting: boolean;
}

export interface Mapping<T = string> {
  source: string;
  target: string;
}

export interface NetworkMap {
  name?: string;
  isPreexisting?: boolean;
  mappings?: Mapping[];
}

export interface StorageMap {
  name: string;
  isPreexisting: boolean;
  mappings?: Mapping[];
}

export interface VirtualMachine {
  sourceName?: string;
  targetName?: string; // If null or different from sourceName, will be used for renaming
  folder?: string; // VM folder path (e.g., 'vm', '/Datacenter/vm/folder1')
}

/**
 * Common storage classes available in the cluster (target storage)
 */
export const StorageClasses = {
  OCS_RBD_VIRTUALIZATION: 'ocs-storagecluster-ceph-rbd-virtualization',
  OCS_RBD: 'ocs-storagecluster-ceph-rbd',
  OCS_CEPHFS: 'ocs-storagecluster-cephfs',
  HOSTPATH_BASIC: 'hostpath-csi-basic',
  STANDARD_CSI: 'standard-csi',
} as const;

/**
 * Common source datastores/storage available from VMware providers
 */
export const SourceStorages = {
  MTV_NFS_RHOS_V8: 'mtv-nfs-rhos-v8',
  MTV_NFS_US_V8: 'mtv-nfs-us-v8',
  NFS_US_MTV_V8: 'nfs-us-mtv-v8',
} as const;

/**
 * Storage offload options used for vSphere XCOPY/VAAI testing.
 * Display names are the user-visible labels in the UI dropdowns.
 * K8s values are the internal representations stored in the CR spec.
 */
export const OffloadPlugins = {
  VSPHERE_XCOPY: 'vSphere XCOPY',
} as const;

export const OffloadPluginK8sValues = {
  VSPHERE_XCOPY: 'vsphereXcopyConfig',
} as const;

export const OffloadSecrets = {
  VS8_SECRET: 'vs8-secret',
} as const;

export const StorageProducts = {
  DELL_POWERFLEX: 'Dell PowerFlex',
  DELL_POWERMAX: 'Dell PowerMax',
  DELL_POWERSTORE: 'Dell PowerStore',
  HITACHI_VANTARA: 'Hitachi Vantara',
  HPE_PRIMERA_3PAR: 'HPE Primera/3PAR',
  IBM_FLASHSYSTEM: 'IBM FlashSystem',
  INFINIDAT_INFINIBOX: 'Infinidat Infinibox',
  NETAPP_ONTAP: 'NetApp ONTAP',
  PURE_STORAGE_FLASHARRAY: 'Pure Storage FlashArray',
} as const;

export const StorageProductK8sValues = {
  NETAPP_ONTAP: 'ontap',
} as const;

export const ALL_STORAGE_PRODUCTS = Object.values(StorageProducts);

/**
 * Target network options for network mapping
 */
export const NetworkTargets = {
  DEFAULT: 'Default network',
  IGNORE: 'Ignore network',
  POD: 'Pod network',
} as const;

/**
 * Common source networks available from VMware providers
 */
export const SourceNetworks = {
  VM_NETWORK: 'VM Network',
  MGMT_NETWORK: 'Mgmt Network',
} as const;

export interface HookConfig {
  enabled: boolean;
  hookRunnerImage?: string;
  serviceAccount?: string;
  ansiblePlaybook?: string;
}

export interface PlanTestData {
  planName: string;
  planProject: string;
  description?: string;
  sourceProvider: string;
  targetProvider: string;
  targetProject: TargetProject;
  networkMap: NetworkMap;
  storageMap: StorageMap;
  virtualMachines?: VirtualMachine[];
  migrationType?: MigrationType;
  criticalIssuesAction?: 'confirm' | 'deselect';
  additionalPlanSettings?: {
    targetPowerState?: 'on' | 'off' | 'auto';
    useNbdeClevis?: boolean;
  };
  preMigrationHook?: HookConfig;
  postMigrationHook?: HookConfig;
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
    planProject: MTV_NAMESPACE,
    description: isVersionAtLeast(V2_11_0) ? 'Test plan for automated testing' : undefined,
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
      mappings: [
        {
          source: 'mtv-nfs-rhos-v8',
          target: 'ocs-storagecluster-ceph-rbd-virtualization',
        },
      ],
    },
    virtualMachines: [{ sourceName: 'mtv-func-rhel9', folder: 'vm' }],
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
  type: ProviderType;
  endpoint_type?: EndpointType;
  api_url: string;
  username: string;
  password: string;
  vddk_init_image?: string;
}
export interface ProviderData {
  name: string;
  projectName: string;
  type: ProviderType;
  endpointType?: EndpointType;
  hostname: string;
  username?: string;
  password?: string;
  fingerprint?: string;
  vddkInitImage?: string;
  skipVddk?: boolean;
  useVddkAioOptimization?: boolean;
  applianceManagement?: boolean;
}

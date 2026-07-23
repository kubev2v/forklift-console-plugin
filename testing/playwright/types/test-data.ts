import { MTV_NAMESPACE } from '../utils/resource-manager/constants';
import { V2_11_0 } from '../utils/version/constants';
import { isVersionAtLeast } from '../utils/version/version';

import type { EndpointType, MigrationType, ProviderType } from './enums';

export type TargetProject = {
  isPreexisting: boolean;
  name: string;
};

export type Mapping = {
  source: string;
  target: string;
};

export type NetworkMap = {
  isPreexisting?: boolean;
  mappings?: Mapping[];
  name?: string;
};

export type StorageMap = {
  isPreexisting: boolean;
  mappings?: Mapping[];
  name: string;
};

export type VirtualMachine = {
  folder?: string; // VM folder path (e.g., 'vm', '/Datacenter/vm/folder1')
  sourceName?: string;
  targetName?: string; // If null or different from sourceName, will be used for renaming
};

/**
 * Common storage classes available in the cluster (target storage)
 */
export const StorageClasses = {
  HOSTPATH_BASIC: 'hostpath-csi-basic',
  OCS_CEPHFS: 'ocs-storagecluster-cephfs',
  OCS_RBD: 'ocs-storagecluster-ceph-rbd',
  OCS_RBD_VIRTUALIZATION: 'ocs-storagecluster-ceph-rbd-virtualization',
  STANDARD_CSI: 'standard-csi',
} as const;

/**
 * Common source datastores/storage available from VMware providers
 */
export const SourceStorages = {
  MTV_NFS_PSI_RDU2_V8: 'mtv-nfs-psi-rdu2-v8',
  MTV_NFS_RHOS_V8: 'mtv-nfs-rhos-v8',
  MTV_NFS_US_V8: 'mtv-nfs-us-v8',
} as const;

export const Ec2SourceStorages = {
  GP2: 'gp2',
  GP3: 'gp3',
  IO1: 'io1',
  IO2: 'io2',
  SC1: 'sc1',
  ST1: 'st1',
  STANDARD: 'standard',
} as const;

export type Ec2SourceStorage = (typeof Ec2SourceStorages)[keyof typeof Ec2SourceStorages];

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
  MGMT_NETWORK: 'Mgmt Network',
  VM_NETWORK: 'VM Network',
} as const;

export type HookConfig = {
  ansiblePlaybook?: string;
  enabled: boolean;
  hookRunnerImage?: string;
  serviceAccount?: string;
};

export type GuestType = 'linux' | 'windows';
export type ScriptType = 'firstboot' | 'run';

export const GUEST_TYPE_LABELS: Record<GuestType, string> = {
  linux: 'Linux',
  windows: 'Windows',
};

export const SCRIPT_TYPE_LABELS: Record<ScriptType, string> = {
  firstboot: 'Firstboot',
  run: 'Run',
};

export type ScriptConfig = {
  content?: string;
  guestType?: GuestType;
  name: string;
  scriptType?: ScriptType;
};

export type CustomizationScriptsTestData =
  | {
      configMapName: string;
      mode: 'existing';
    }
  | {
      mode: 'new';
      scripts: ScriptConfig[];
    };

export type PlanTestData = {
  additionalPlanSettings?: {
    existingLUKSSecretName?: string;
    /** VM display name → resolved instance type label */
    instanceTypes?: Record<string, string>;
    /**
     * Set to false to uncheck "Preserve static IPs" in the wizard.
     * Default in the wizard is true; powered-off VMs have no IPs and will
     * cause a critical plan concern when this is left enabled.
     */
    preserveStaticIPs?: boolean;
    targetPowerState?: 'on' | 'off' | 'auto';
    useNbdeClevis?: boolean;
  };
  criticalIssuesAction?: 'confirm' | 'deselect';
  customizationScripts?: CustomizationScriptsTestData;
  description?: string;
  migrationType?: MigrationType;
  networkMap: NetworkMap;
  planName: string;
  planProject: string;
  postMigrationHook?: HookConfig;
  preMigrationHook?: HookConfig;
  sourceProvider: string;
  storageMap: StorageMap;
  targetProject: TargetProject;
  targetProvider: string;
  virtualMachines?: VirtualMachine[];
};

/**
 * Helper to create plan test data with proper typing
 */
export const createPlanTestData = (
  overrides: Partial<PlanTestData> & { sourceProvider: string },
): PlanTestData => {
  const uniqueId = crypto.randomUUID();
  const planName = `test-plan-${uniqueId}`;

  const defaults: PlanTestData = {
    description: isVersionAtLeast(V2_11_0) ? 'Test plan for automated testing' : undefined,
    networkMap: {
      isPreexisting: false,
      name: `${planName}-network-map`,
    },
    planName,
    planProject: MTV_NAMESPACE,
    sourceProvider: 'test-provider',
    storageMap: {
      isPreexisting: false,
      mappings: [
        {
          // qemtv-09 vs8 inventory exposes mtv-nfs-psi-rdu2-v8 (mtv-nfs-rhos-v8 removed).
          source: SourceStorages.MTV_NFS_PSI_RDU2_V8,
          target: 'ocs-storagecluster-ceph-rbd-virtualization',
        },
      ],
      name: `${planName}-storage-map`,
    },
    targetProject: {
      isPreexisting: false,
      name: `test-project-${uniqueId}`,
    },
    targetProvider: 'host',
    // qemtv-09 vs8 inventory no longer has mtv-func-rhel9; use a present lab VM.
    virtualMachines: [{ folder: 'vm', sourceName: 'mtv-rhel8-warm-sanity' }],
  };

  return {
    ...defaults,
    ...overrides,
    networkMap: { ...defaults.networkMap, ...overrides.networkMap },
    storageMap: { ...defaults.storageMap, ...overrides.storageMap },
    targetProject: { ...defaults.targetProject, ...overrides.targetProject },
  };
};

export type ProviderConfig = {
  access_key_id?: string;
  api_url: string;
  auto_target_credentials?: boolean;
  endpoint_type?: EndpointType;
  password?: string;
  prism_type?: string;
  project_name?: string;
  region?: string;
  region_name?: string;
  secret_access_key?: string;
  smb_password?: string;
  smb_url?: string;
  smb_username?: string;
  type: ProviderType;
  user_domain_name?: string;
  username?: string;
  vddk_init_image?: string;
};
export type ProviderData = {
  accessKeyId?: string;
  applianceManagement?: boolean;
  autoTargetCredentials?: boolean;
  crossAccountCredentials?: boolean;
  domainName?: string;
  ec2Region?: string;
  endpointType?: EndpointType;
  fingerprint?: string;
  hostname: string;
  name: string;
  openstackProjectName?: string;
  password?: string;
  prismType?: string;
  projectName: string;
  regionName?: string;
  secretAccessKey?: string;
  skipVddk?: boolean;
  smbPassword?: string;
  smbUrl?: string;
  smbUsername?: string;
  targetAccessKeyId?: string;
  targetAz?: string;
  targetRegion?: string;
  targetSecretAccessKey?: string;
  type: ProviderType;
  useDifferentSmbCredentials?: boolean;
  username?: string;
  useVddkAioOptimization?: boolean;
  vddkInitImage?: string;
};

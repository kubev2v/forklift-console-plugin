import { EndpointType, ProviderType } from '../../../types/enums';
import type { ProviderData } from '../../../types/test-data';
import { getProviderConfig } from '../../../utils/providers';
import { MTV_NAMESPACE } from '../../../utils/resource-manager/constants';
import { V2_11_0, V2_12_0, V2_13_0 } from '../../../utils/version/constants';
import type { VersionTuple } from '../../../utils/version/types';

const VSPHERE_KEY = process.env.VSPHERE_PROVIDER ?? 'vsphere-8.0.1';
const OVA_KEY = process.env.OVA_PROVIDER ?? 'ova';
const OVIRT_KEY = process.env.OVIRT_PROVIDER ?? 'ovirt-4.4.9';
const OPENSTACK_KEY = process.env.OPENSTACK_PROVIDER ?? 'openstack-psi';
const HYPERV_KEY = process.env.HYPERV_PROVIDER ?? 'hyperv-smb';
const EC2_KEY = process.env.EC2_PROVIDER ?? 'ec2';
const NUTANIX_KEY = process.env.NUTANIX_PROVIDER ?? 'nutanix';

export type ProviderTestScenario = {
  minVersion?: VersionTuple;
  providerDataOverrides?: Partial<ProviderData>;
  providerKey: string;
  providerType: ProviderType;
  scenarioName: string;
  /** When true, also deletes the just-created provider via the Actions menu. */
  verifyDelete?: boolean;
};

export const createProviderData = (
  providerType: ProviderType,
  providerKey: string,
  overrides?: Partial<ProviderData>,
): ProviderData => {
  const providerConfig = getProviderConfig(providerKey);
  const uniqueId = crypto.randomUUID().slice(0, 8);

  const baseData: ProviderData = {
    hostname: providerConfig.api_url,
    name: `test-${providerType}-provider-${uniqueId}`,
    projectName: MTV_NAMESPACE,
    type: providerConfig.type,
  };

  if (providerType !== ProviderType.OVA) {
    baseData.username = providerConfig.username;
    baseData.password = providerConfig.password;
  }

  if (providerType === ProviderType.VSPHERE) {
    baseData.endpointType = providerConfig.endpoint_type ?? EndpointType.VCENTER;
    baseData.vddkInitImage = providerConfig.vddk_init_image;
  }

  if (providerType === ProviderType.OPENSTACK) {
    baseData.regionName = providerConfig.region_name;
    baseData.openstackProjectName = providerConfig.project_name;
    baseData.domainName = providerConfig.user_domain_name;
  }

  if (providerType === ProviderType.HYPERV) {
    baseData.smbUrl = providerConfig.smb_url;
    if (providerConfig.smb_username) {
      baseData.useDifferentSmbCredentials = true;
      baseData.smbUsername = providerConfig.smb_username;
      baseData.smbPassword = providerConfig.smb_password;
    }
  }

  if (providerType === ProviderType.EC2) {
    baseData.accessKeyId = providerConfig.access_key_id;
    baseData.autoTargetCredentials = true;
    baseData.ec2Region = providerConfig.region_name ?? providerConfig.region;
    baseData.secretAccessKey = providerConfig.secret_access_key;
  }

  if (providerType === ProviderType.NUTANIX) {
    baseData.prismType = providerConfig.prism_type ?? 'element';
  }

  return { ...baseData, ...overrides };
};

export const providerTestScenarios: ProviderTestScenario[] = [
  {
    minVersion: V2_11_0,
    providerDataOverrides: { useVddkAioOptimization: true },
    providerKey: VSPHERE_KEY,
    providerType: ProviderType.VSPHERE,
    scenarioName: 'vSphere with VDDK AIO optimization enabled',
  },
  {
    providerDataOverrides: { useVddkAioOptimization: false },
    providerKey: VSPHERE_KEY,
    providerType: ProviderType.VSPHERE,
    scenarioName: 'vSphere with VDDK AIO optimization disabled',
    verifyDelete: true,
  },
  {
    minVersion: V2_11_0,
    providerKey: OVA_KEY,
    providerType: ProviderType.OVA,
    scenarioName: 'OVA provider',
  },
  {
    providerKey: OVIRT_KEY,
    providerType: ProviderType.OVIRT,
    scenarioName: 'oVirt provider',
  },
  {
    providerKey: OPENSTACK_KEY,
    providerType: ProviderType.OPENSTACK,
    scenarioName: 'OpenStack provider with password authentication',
  },
  {
    minVersion: V2_12_0,
    providerKey: EC2_KEY,
    providerType: ProviderType.EC2,
    scenarioName: 'Amazon EC2 provider with auto-detect target settings',
  },
  {
    minVersion: V2_12_0,
    providerKey: HYPERV_KEY,
    providerType: ProviderType.HYPERV,
    scenarioName: 'Hyper-V provider with SMB share',
  },
  {
    minVersion: V2_13_0,
    providerKey: NUTANIX_KEY,
    providerType: ProviderType.NUTANIX,
    scenarioName: 'Nutanix AHV provider with Prism Element',
  },
];

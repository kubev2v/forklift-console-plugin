import { EndpointType, ProviderType } from '../../../types/enums';
import type { ProviderData } from '../../../types/test-data';
import { getProviderConfig } from '../../../utils/providers';
import { MTV_NAMESPACE } from '../../../utils/resource-manager/constants';
import { V2_11_0 } from '../../../utils/version/constants';
import type { VersionTuple } from '../../../utils/version/types';

const VSPHERE_KEY = process.env.VSPHERE_PROVIDER ?? 'vsphere-8.0.1';
const OVA_KEY = process.env.OVA_PROVIDER ?? 'ova';

export type ProviderTestScenario = {
  scenarioName: string;
  providerType: ProviderType;
  providerKey: string;
  providerDataOverrides?: Partial<ProviderData>;
  minVersion?: VersionTuple;
};

export const createProviderData = (
  providerType: ProviderType,
  providerKey: string,
  overrides?: Partial<ProviderData>,
): ProviderData => {
  const providerConfig = getProviderConfig(providerKey);
  const uniqueId = crypto.randomUUID().slice(0, 8);

  const baseData: ProviderData = {
    name: `test-${providerType}-provider-${uniqueId}`,
    projectName: MTV_NAMESPACE,
    type: providerConfig.type,
    hostname: providerConfig.api_url,
  };

  if (providerType !== ProviderType.OVA) {
    baseData.username = providerConfig.username;
    baseData.password = providerConfig.password;
  }

  if (providerType === ProviderType.VSPHERE) {
    baseData.endpointType = providerConfig.endpoint_type ?? EndpointType.VCENTER;
    baseData.vddkInitImage = providerConfig.vddk_init_image;
  }

  return { ...baseData, ...overrides };
};

export const providerTestScenarios: ProviderTestScenario[] = [
  {
    scenarioName: 'vSphere with VDDK AIO optimization enabled',
    providerType: ProviderType.VSPHERE,
    providerKey: VSPHERE_KEY,
    providerDataOverrides: { useVddkAioOptimization: true },
    minVersion: V2_11_0,
  },
  {
    scenarioName: 'vSphere with VDDK AIO optimization disabled',
    providerType: ProviderType.VSPHERE,
    providerKey: VSPHERE_KEY,
    providerDataOverrides: { useVddkAioOptimization: false },
  },
  {
    scenarioName: 'OVA provider',
    providerType: ProviderType.OVA,
    providerKey: OVA_KEY,
    minVersion: V2_11_0,
  },
];

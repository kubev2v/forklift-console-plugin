import type { IoK8sApiCoreV1Secret, V1beta1Provider } from '@forklift-ui/types';
import { PROVIDER_TYPES } from '@utils/providers/constants';

import { ProviderFormFieldId } from '../fields/constants';
import type { CreateProviderFormData } from '../types';

import { buildEc2ProviderResources } from './buildEc2ProviderResources';
import { buildHypervProviderResources } from './buildHypervProviderResources';
import { buildNutanixProviderResources } from './buildNutanixProviderResources';
import { buildOpenshiftProviderResources } from './buildOpenshiftProviderResources';
import { buildOpenstackProviderResources } from './buildOpenstackProviderResources';
import { buildOvaProviderResources } from './buildOvaProviderResources';
import { buildOvirtProviderResources } from './buildOvirtProviderResources';
import { buildVsphereProviderResources } from './buildVsphereProviderResources';

type ProviderResources = {
  provider: V1beta1Provider;
  secret: IoK8sApiCoreV1Secret;
};

export const buildProviderResources = (formData: CreateProviderFormData): ProviderResources => {
  const providerType = formData[ProviderFormFieldId.ProviderType];

  switch (providerType) {
    case PROVIDER_TYPES.ec2:
      return buildEc2ProviderResources(formData);
    case PROVIDER_TYPES.ova:
      return buildOvaProviderResources(formData);
    case PROVIDER_TYPES.hyperv:
      return buildHypervProviderResources(formData);
    case PROVIDER_TYPES.nutanix:
      return buildNutanixProviderResources(formData);
    case PROVIDER_TYPES.openshift:
      return buildOpenshiftProviderResources(formData);
    case PROVIDER_TYPES.openstack:
      return buildOpenstackProviderResources(formData);
    case PROVIDER_TYPES.ovirt:
      return buildOvirtProviderResources(formData);
    case PROVIDER_TYPES.vsphere:
      return buildVsphereProviderResources(formData);
    case undefined:
    default:
      throw new Error(`Unsupported provider type: ${providerType}`);
  }
};

import { PROVIDER_TYPES } from 'src/providers/utils/constants';

import type { IoK8sApiCoreV1Secret, V1beta1Provider } from '@kubev2v/types';

import { ProviderFormFieldId } from '../fields/constants';
import type { CreateProviderFormData } from '../types';

import { buildOpenshiftProviderResources } from './buildOpenshiftProviderResources';
import { buildOpenstackProviderResources } from './buildOpenstackProviderResources';
import { buildOvaProviderResources } from './buildOvaProviderResources';
import { buildOvirtProviderResources } from './buildOvirtProviderResources';

type ProviderResources = {
  provider: V1beta1Provider;
  secret: IoK8sApiCoreV1Secret;
};

export const buildProviderResources = (formData: CreateProviderFormData): ProviderResources => {
  const providerType = formData[ProviderFormFieldId.ProviderType];

  switch (providerType) {
    case PROVIDER_TYPES.ova:
      return buildOvaProviderResources(formData);
    case PROVIDER_TYPES.openshift:
      return buildOpenshiftProviderResources(formData);
    case PROVIDER_TYPES.openstack:
      return buildOpenstackProviderResources(formData);
    case PROVIDER_TYPES.ovirt:
      return buildOvirtProviderResources(formData);
    case PROVIDER_TYPES.vsphere:
    case undefined:
    default:
      // TODO (MTV-3737): Implement remaining provider types
      throw new Error(`Unsupported provider type: ${providerType}`);
  }
};

import { PROVIDER_TYPES, TRUE_VALUE } from 'src/providers/utils/constants';

import type { IoK8sApiCoreV1Secret, V1beta1Provider } from '@forklift-ui/types';

import { ProviderFormFieldId } from '../fields/constants';
import type { OvaFormData } from '../types';

import { buildProviderObject } from './buildProviderObject';
import { buildSecretObject } from './buildSecretObject';

type ProviderResources = {
  provider: V1beta1Provider;
  secret: IoK8sApiCoreV1Secret;
};

export const buildOvaProviderResources = (formData: OvaFormData): ProviderResources => {
  const namespace = formData[ProviderFormFieldId.ProviderProject];
  const providerName = formData[ProviderFormFieldId.ProviderName];
  const nfsDirectory = formData[ProviderFormFieldId.NfsDirectory] ?? '';
  const applianceManagement = formData[ProviderFormFieldId.OvaApplianceManagement];

  const provider = buildProviderObject({
    name: providerName,
    namespace,
    type: PROVIDER_TYPES.ova,
    url: nfsDirectory,
  });

  if (applianceManagement && provider.spec) {
    provider.spec.settings = {
      ...provider.spec.settings,
      applianceManagement: TRUE_VALUE,
    };
  }

  const secret = buildSecretObject({
    namespace,
  });

  return { provider, secret };
};

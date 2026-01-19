import { encode } from 'js-base64';
import { PROVIDER_TYPES } from 'src/providers/utils/constants';

import type { IoK8sApiCoreV1Secret, V1beta1Provider } from '@kubev2v/types';

import { ProviderFormFieldId } from '../fields/constants';
import type { HypervFormData } from '../types';

import { buildProviderObject } from './buildProviderObject';
import { buildSecretObject } from './buildSecretObject';

type ProviderResources = {
  provider: V1beta1Provider;
  secret: IoK8sApiCoreV1Secret;
};

export const buildHypervProviderResources = (formData: HypervFormData): ProviderResources => {
  const namespace = formData[ProviderFormFieldId.ProviderProject];
  const providerName = formData[ProviderFormFieldId.ProviderName];
  const smbDirectory = formData[ProviderFormFieldId.SmbDirectory] ?? '';
  const username = formData[ProviderFormFieldId.SmbUsername];
  const password = formData[ProviderFormFieldId.SmbPassword];

  const provider = buildProviderObject({
    name: providerName,
    namespace,
    type: PROVIDER_TYPES.hyperv,
    url: smbDirectory,
  });

  const secretData: Record<string, string> = {
    insecureSkipVerify: encode('false'),
    ...(username?.trim() && { username: encode(username.trim()) }),
    ...(password?.trim() && { password: encode(password.trim()) }),
  };

  const secret = buildSecretObject({
    data: secretData,
    namespace,
  });

  return { provider, secret };
};

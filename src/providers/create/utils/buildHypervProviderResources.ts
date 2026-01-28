import { encode } from 'js-base64';
import { PROVIDER_TYPES } from 'src/providers/utils/constants';

import type { IoK8sApiCoreV1Secret, V1beta1Provider } from '@forklift-ui/types';

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
  const hypervHost = formData[ProviderFormFieldId.HypervHost] ?? '';
  const username = formData[ProviderFormFieldId.HypervUsername] ?? '';
  const password = formData[ProviderFormFieldId.HypervPassword] ?? '';
  const smbUrl = formData[ProviderFormFieldId.SmbUrl] ?? '';
  const useDifferentSmbCredentials = formData[ProviderFormFieldId.UseDifferentSmbCredentials];
  const smbUser = formData[ProviderFormFieldId.SmbUser] ?? '';
  const smbPassword = formData[ProviderFormFieldId.SmbPassword] ?? '';
  const providerUrl = hypervHost;

  const provider = buildProviderObject({
    name: providerName,
    namespace,
    type: PROVIDER_TYPES.hyperv,
    url: providerUrl,
  });

  const secretData: Record<string, string> = {
    ...(username?.trim() && { username: encode(username.trim()) }),
    ...(password?.trim() && { password: encode(password.trim()) }),
    ...(smbUrl?.trim() && { smbUrl: encode(smbUrl.trim()) }),
  };

  // Add optional SMB credentials if different from Hyper-V credentials
  if (useDifferentSmbCredentials) {
    if (smbUser?.trim()) {
      secretData.smbUser = encode(smbUser.trim());
    }
    if (smbPassword?.trim()) {
      secretData.smbPassword = encode(smbPassword.trim());
    }
  }

  const secret = buildSecretObject({
    data: secretData,
    namespace,
  });

  return { provider, secret };
};

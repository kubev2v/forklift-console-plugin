import { encode } from 'js-base64';
import { PROVIDER_TYPES } from 'src/providers/utils/constants';

import type { IoK8sApiCoreV1Secret, V1beta1Provider } from '@kubev2v/types';
import { encodeFormValue } from '@utils/helpers/encodeFormValue';

import { ProviderFormFieldId } from '../fields/constants';
import type { OvaFormData } from '../types';

import { buildProviderObject } from './buildProviderObject';
import { buildSecretObject } from './buildSecretObject';

type ProviderResources = {
  provider: V1beta1Provider;
  secret: IoK8sApiCoreV1Secret;
};

/**
 * Builds Kubernetes resources for HyperV provider
 * Follows the same pattern as OVA provider but includes SMB credentials
 */
export const buildHypervProviderResources = (formData: OvaFormData): ProviderResources => {
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
    ...(username?.trim() && { username: encodeFormValue(username) }),
    ...(password?.trim() && { password: encodeFormValue(password) }),
  };

  const secret = buildSecretObject({
    data: secretData,
    namespace,
  });

  return { provider, secret };
};

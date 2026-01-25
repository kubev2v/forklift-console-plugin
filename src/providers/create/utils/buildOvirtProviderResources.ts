import { encode } from 'js-base64';
import { PROVIDER_TYPES } from 'src/providers/utils/constants';

import type { IoK8sApiCoreV1Secret, V1beta1Provider } from '@forklift-ui/types';
import { encodeFormValue } from '@utils/helpers/encodeFormValue';

import { CertificateValidationMode, ProviderFormFieldId } from '../fields/constants';
import type { OvirtFormData } from '../types';

import { buildProviderObject } from './buildProviderObject';
import { buildSecretObject } from './buildSecretObject';

type ProviderResources = {
  provider: V1beta1Provider;
  secret: IoK8sApiCoreV1Secret;
};

export const buildOvirtProviderResources = (formData: OvirtFormData): ProviderResources => {
  const namespace = formData[ProviderFormFieldId.ProviderProject];
  const providerName = formData[ProviderFormFieldId.ProviderName];
  const ovirtUrl = formData[ProviderFormFieldId.OvirtUrl];
  const username = formData[ProviderFormFieldId.OvirtUsername];
  const password = formData[ProviderFormFieldId.OvirtPassword];
  const certificateValidation = formData[ProviderFormFieldId.CertificateValidation];
  const caCertificate = formData[ProviderFormFieldId.CaCertificate] ?? '';

  const skipCertValidation = certificateValidation === CertificateValidationMode.Skip;
  const url = ovirtUrl?.trim() ?? '';

  const provider = buildProviderObject({
    name: providerName,
    namespace,
    type: PROVIDER_TYPES.ovirt,
    url,
  });

  const secretData: Record<string, string> = {
    insecureSkipVerify: encode(skipCertValidation ? 'true' : 'false'),
    url: encode(url),
    ...(username?.trim() && { user: encodeFormValue(username) }),
    ...(password?.trim() && { password: encodeFormValue(password) }),
  };

  if (!skipCertValidation && caCertificate?.trim()) {
    secretData.cacert = encode(caCertificate.trim());
  }

  const secret = buildSecretObject({
    data: secretData,
    namespace,
  });

  return { provider, secret };
};

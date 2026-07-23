import { encode } from 'js-base64';

import type { IoK8sApiCoreV1Secret, V1beta1Provider } from '@forklift-ui/types';
import { PROVIDER_TYPES } from '@utils/providers/constants';

import {
  CertificateValidationMode,
  NutanixPrismType,
  ProviderFormFieldId,
} from '../fields/constants';
import type { NutanixFormData } from '../types';

import { buildProviderObject } from './buildProviderObject';
import { buildSecretObject } from './buildSecretObject';

type ProviderResources = {
  provider: V1beta1Provider;
  secret: IoK8sApiCoreV1Secret;
};

export const buildNutanixProviderResources = (formData: NutanixFormData): ProviderResources => {
  const namespace = formData[ProviderFormFieldId.ProviderProject];
  const providerName = formData[ProviderFormFieldId.ProviderName];
  const nutanixUrl = formData[ProviderFormFieldId.NutanixUrl] ?? '';
  const username = formData[ProviderFormFieldId.NutanixUsername] ?? '';
  const password = formData[ProviderFormFieldId.NutanixPassword] ?? '';
  const prismType = formData[ProviderFormFieldId.NutanixPrismType] ?? NutanixPrismType.Element;
  const certificateValidation = formData[ProviderFormFieldId.CertificateValidation];
  const caCertificate = formData[ProviderFormFieldId.CaCertificate] ?? '';
  const skipCertValidation = certificateValidation === CertificateValidationMode.Skip;

  const settings: Record<string, string> = {
    prismType,
  };

  const provider = buildProviderObject({
    name: providerName,
    namespace,
    settings,
    type: PROVIDER_TYPES.nutanix,
    url: nutanixUrl,
  });

  const secretData: Record<string, string> = {
    insecureSkipVerify: encode(skipCertValidation ? 'true' : 'false'),
    ...(username?.trim() && { user: encode(username.trim()) }),
    ...(password?.trim() && { password: encode(password.trim()) }),
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

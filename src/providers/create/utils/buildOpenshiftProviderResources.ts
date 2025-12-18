import { encode } from 'js-base64';
import { PROVIDER_TYPES } from 'src/providers/utils/constants';

import type { IoK8sApiCoreV1Secret, V1beta1Provider } from '@kubev2v/types';

import { CertificateValidationMode, ProviderFormFieldId } from '../fields/constants';
import type { OpenshiftFormData } from '../types';

import { buildProviderObject } from './buildProviderObject';
import { buildSecretObject } from './buildSecretObject';

type ProviderResources = {
  provider: V1beta1Provider;
  secret: IoK8sApiCoreV1Secret;
};

export const buildOpenshiftProviderResources = (formData: OpenshiftFormData): ProviderResources => {
  const namespace = formData[ProviderFormFieldId.ProviderProject];
  const providerName = formData[ProviderFormFieldId.ProviderName];
  const openshiftUrl = formData[ProviderFormFieldId.OpenshiftUrl];
  const token = formData[ProviderFormFieldId.ServiceAccountToken] ?? '';
  const certificateValidation = formData[ProviderFormFieldId.CertificateValidation];
  const caCertificate = formData[ProviderFormFieldId.CaCertificate] ?? '';

  const skipCertValidation = certificateValidation === CertificateValidationMode.Skip;
  const url = openshiftUrl?.trim() ?? '';

  const provider = buildProviderObject({
    name: providerName,
    namespace,
    type: PROVIDER_TYPES.openshift,
    url,
  });

  const secretData: Record<string, string> = {
    insecureSkipVerify: encode(skipCertValidation ? 'true' : 'false'),
    token: encode(token),
    url: encode(url),
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

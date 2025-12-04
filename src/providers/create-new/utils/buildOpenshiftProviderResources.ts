import { encode } from 'js-base64';

import type { IoK8sApiCoreV1Secret, V1beta1Provider } from '@kubev2v/types';

import { CertificateValidationMode, ProviderFormFieldId } from '../fields/constants';
import type { CreateProviderFormData } from '../types';

type ProviderResources = {
  provider: V1beta1Provider;
  secret: IoK8sApiCoreV1Secret;
};

export const buildOpenshiftProviderResources = (
  formData: CreateProviderFormData,
): ProviderResources => {
  const namespace = formData[ProviderFormFieldId.ProviderProject];
  const providerName = formData[ProviderFormFieldId.ProviderName];
  const openshiftUrl = formData[ProviderFormFieldId.OpenshiftUrl];
  const token = formData[ProviderFormFieldId.ServiceAccountToken] ?? '';
  const certificateValidation = formData[ProviderFormFieldId.CertificateValidation];
  const caCertificate = formData[ProviderFormFieldId.CaCertificate] ?? '';

  const skipCertValidation = certificateValidation === CertificateValidationMode.Skip;
  const url = openshiftUrl?.trim() ?? '';

  const provider: V1beta1Provider = {
    apiVersion: 'forklift.konveyor.io/v1beta1',
    kind: 'Provider',
    metadata: {
      name: providerName,
      namespace,
    },
    spec: {
      secret: {
        name: undefined,
        namespace,
      },
      type: 'openshift',
      url,
    },
  };

  const secretData: Record<string, string> = {
    insecureSkipVerify: encode(skipCertValidation ? 'true' : 'false'),
    token: encode(token),
    url: encode(url),
  };

  if (!skipCertValidation && caCertificate?.trim()) {
    secretData.cacert = encode(caCertificate.trim());
  }

  const secret: IoK8sApiCoreV1Secret = {
    apiVersion: 'v1',
    data: secretData,
    kind: 'Secret',
    metadata: {
      namespace,
    },
    type: 'Opaque',
  };

  return { provider, secret };
};

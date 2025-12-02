import type { IoK8sApiCoreV1Secret, V1beta1Provider } from '@kubev2v/types';

import { ProviderFormFieldId } from '../fields/constants';
import type { CreateProviderFormData } from '../types';

export const buildOvaProviderResources = (
  formData: CreateProviderFormData,
): {
  provider: V1beta1Provider;
  secret: IoK8sApiCoreV1Secret;
} => {
  const namespace = formData[ProviderFormFieldId.ProviderProject];
  const providerName = formData[ProviderFormFieldId.ProviderName];
  const nfsDirectory = formData[ProviderFormFieldId.NfsDirectory] ?? '';

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
      type: 'ova',
      url: nfsDirectory,
    },
  };

  const secret: IoK8sApiCoreV1Secret = {
    apiVersion: 'v1',
    kind: 'Secret',
    metadata: {
      namespace,
    },
    type: 'Opaque',
  };

  return { provider, secret };
};

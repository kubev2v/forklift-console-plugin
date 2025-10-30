import type {
  V1beta1Provider,
  V1beta1ProviderSpec,
  V1beta1ProviderSpecSecret,
} from '@kubev2v/types';

const providerSpecSecretTemplate: V1beta1ProviderSpecSecret = {
  name: undefined,
  namespace: undefined,
};

export const providerSpecTemplate: V1beta1ProviderSpec = {
  secret: { ...providerSpecSecretTemplate },
  type: '',
  url: undefined,
};

const providerTemplate: V1beta1Provider = {
  apiVersion: 'forklift.konveyor.io/v1beta1',
  kind: 'Provider',
  metadata: {
    name: undefined,
    namespace: undefined,
  },
  spec: { ...providerSpecTemplate },
};

export const getProviderTemplateWithNamespace = (namespace: string): V1beta1Provider => {
  return {
    ...providerTemplate,
    metadata: {
      ...providerTemplate.metadata,
      namespace,
    },
  };
};

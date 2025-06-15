import type { V1beta1Provider } from '@kubev2v/types';

const providerTemplate: V1beta1Provider = {
  apiVersion: 'forklift.konveyor.io/v1beta1',
  kind: 'Provider',
  metadata: {
    name: undefined,
    namespace: undefined,
  },
  spec: {
    secret: {
      name: undefined,
      namespace: undefined,
    },
    type: undefined,
    url: undefined,
  },
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

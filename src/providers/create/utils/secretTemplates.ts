import type { IoK8sApiCoreV1Secret } from '@kubev2v/types';

const secretTemplate: IoK8sApiCoreV1Secret = {
  apiVersion: 'v1',
  data: undefined,
  kind: 'Secret',
  metadata: {
    name: undefined,
    namespace: undefined,
  },
  type: 'Opaque',
};

export const getSecretTemplateWithNamespace = (namespace: string): IoK8sApiCoreV1Secret => {
  return {
    ...secretTemplate,
    metadata: {
      ...secretTemplate.metadata,
      namespace,
    },
  };
};

import type { IoK8sApiCoreV1Secret } from '@kubev2v/types';

export const secretTemplate: IoK8sApiCoreV1Secret = {
  apiVersion: 'v1',
  data: undefined,
  kind: 'Secret',
  metadata: {
    name: undefined,
    namespace: undefined,
  },
  type: 'Opaque',
};

import { IoK8sApiCoreV1Secret } from '@kubev2v/types';

export const secretTemplate: IoK8sApiCoreV1Secret = {
  kind: 'Secret',
  apiVersion: 'v1',
  metadata: {
    name: undefined,
    namespace: undefined,
  },
  data: undefined,
  type: 'Opaque',
};

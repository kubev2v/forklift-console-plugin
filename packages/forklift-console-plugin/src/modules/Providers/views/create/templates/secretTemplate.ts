import { V1Secret } from '@kubev2v/types';

export const secretTemplate: V1Secret = {
  kind: 'Secret',
  apiVersion: 'v1',
  metadata: {
    name: undefined,
    namespace: undefined,
  },
  data: undefined,
  type: 'Opaque',
};

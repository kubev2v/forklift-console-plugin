import { V1beta1Provider } from '@kubev2v/types';

export const providerTemplate: V1beta1Provider = {
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

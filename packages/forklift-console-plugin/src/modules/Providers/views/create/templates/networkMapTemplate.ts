import { V1beta1NetworkMap } from '@kubev2v/types';

export const networkMapTemplate: V1beta1NetworkMap = {
  apiVersion: 'forklift.konveyor.io/v1beta1',
  kind: 'NetworkMap',
  metadata: {
    name: undefined,
    namespace: undefined,
  },
};

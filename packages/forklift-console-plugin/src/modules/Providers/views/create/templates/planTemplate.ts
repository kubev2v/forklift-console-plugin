import { V1beta1Plan } from '@kubev2v/types';

export const planTemplate: V1beta1Plan = {
  apiVersion: 'forklift.konveyor.io/v1beta1',
  kind: 'Plan',
  metadata: {
    name: undefined,
    namespace: undefined,
  },
  spec: {
    map: {},
    targetNamespace: '',
  },
};

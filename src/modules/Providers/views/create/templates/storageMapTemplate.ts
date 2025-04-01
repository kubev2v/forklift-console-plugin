import { V1beta1StorageMap } from '@kubev2v/types';

export const storageMapTemplate: V1beta1StorageMap = {
  apiVersion: 'forklift.konveyor.io/v1beta1',
  kind: 'StorageMap',
  metadata: {
    name: undefined,
    namespace: undefined,
  },
};

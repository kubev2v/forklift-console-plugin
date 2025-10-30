import type { IoK8sApimachineryPkgApisMetaV1ObjectMeta } from '@kubev2v/types';

// based on the method used in legacy/src/common/helpers
// and mocks/src/definitions/utils
export type ObjectRef = {
  apiVersion: string;
  kind: string;
  name?: string;
  namespace?: string;
  uid?: string;
};

export const getObjectRef = (
  {
    apiVersion,
    kind,
    metadata: { name, namespace, uid } = {},
  }: {
    apiVersion: string;
    kind: string;
    metadata?: IoK8sApimachineryPkgApisMetaV1ObjectMeta;
  } = {
    apiVersion: '',
    kind: '',
  },
): ObjectRef => ({
  apiVersion,
  kind,
  name,
  namespace,
  uid,
});

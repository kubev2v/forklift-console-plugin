import type { ObjectRef } from 'src/modules/Providers/views/migrate/reducer/helpers';

import type { V1beta1NetworkMap, V1beta1StorageMap } from '@kubev2v/types';
import { type K8sModel, k8sPatch } from '@openshift-console/dynamic-plugin-sdk';

/**
 * Adds owner references to a resource
 * This establishes parent-child relationships between Kubernetes resources
 */
export const addOwnerRef = async (
  model: K8sModel,
  resource: V1beta1NetworkMap | V1beta1StorageMap,
  ownerReferences: ObjectRef[],
) => {
  // Remove namespace field from owner references as it's not needed
  const cleanOwnerReferences = ownerReferences.map((ref) => ({
    ...ref,
    namespace: undefined,
  }));

  return k8sPatch({
    data: [
      {
        op: 'add',
        path: '/metadata/ownerReferences',
        value: cleanOwnerReferences,
      },
    ],
    model,
    resource,
  });
};

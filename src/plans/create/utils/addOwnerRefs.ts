import type {
  IoK8sApiCoreV1Secret,
  V1beta1Hook,
  V1beta1NetworkMap,
  V1beta1StorageMap,
} from '@kubev2v/types';
import { type K8sModel, k8sPatch } from '@openshift-console/dynamic-plugin-sdk';
import { isEmpty } from '@utils/helpers';
import type { ObjectRef } from '@utils/helpers/getObjectRef';

/**
 * Adds owner references to a resource
 * This establishes parent-child relationships between Kubernetes resources
 */
export const addOwnerRefs = async (
  model: K8sModel,
  resource: V1beta1NetworkMap | V1beta1StorageMap | IoK8sApiCoreV1Secret | V1beta1Hook,
  newOwnerReferences: ObjectRef[],
) => {
  const existingOwnerReferences = resource.metadata?.ownerReferences;
  const ownerReferences =
    existingOwnerReferences && !isEmpty(existingOwnerReferences)
      ? [...existingOwnerReferences, ...newOwnerReferences]
      : newOwnerReferences;

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

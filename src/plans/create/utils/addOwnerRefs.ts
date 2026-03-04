import {
  type K8sModel,
  k8sPatch,
  type K8sResourceCommon,
} from '@openshift-console/dynamic-plugin-sdk';
import { isEmpty } from '@utils/helpers';
import type { ObjectRef } from '@utils/helpers/getObjectRef';

export const addOwnerRefs = async (
  model: K8sModel,
  resource: K8sResourceCommon,
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

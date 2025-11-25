import {
  HookModel,
  type IoK8sApiCoreV1Secret,
  NetworkMapModel,
  SecretModel,
  StorageMapModel,
  type V1beta1Hook,
  type V1beta1NetworkMap,
  type V1beta1StorageMap,
} from '@kubev2v/types';
import type { ObjectRef } from '@utils/helpers/getObjectRef';

import { addOwnerRefs } from './addOwnerRefs';

/**
 * Adds owner references to all created resources for a created plan
 */
export const addPlanResourceOwnerRefs = async (
  resources: {
    networkMap: V1beta1NetworkMap;
    storageMap: V1beta1StorageMap;
    secret?: IoK8sApiCoreV1Secret;
    hooks: { preHook?: V1beta1Hook; postHook?: V1beta1Hook };
  },
  planRef: ObjectRef,
) => {
  const ownerRefRequests: ReturnType<typeof addOwnerRefs>[] = [
    addOwnerRefs(StorageMapModel, resources.storageMap, [planRef]),
    addOwnerRefs(NetworkMapModel, resources.networkMap, [planRef]),
  ];

  if (resources.secret) {
    ownerRefRequests.push(addOwnerRefs(SecretModel, resources.secret, [planRef]));
  }

  if (resources.hooks.preHook) {
    ownerRefRequests.push(addOwnerRefs(HookModel, resources.hooks.preHook, [planRef]));
  }

  if (resources.hooks.postHook) {
    ownerRefRequests.push(addOwnerRefs(HookModel, resources.hooks.postHook, [planRef]));
  }

  await Promise.all(ownerRefRequests);
};

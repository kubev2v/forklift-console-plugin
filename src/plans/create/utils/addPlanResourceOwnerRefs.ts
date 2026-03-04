import {
  HookModel,
  type IoK8sApiCoreV1ConfigMap,
  type IoK8sApiCoreV1Secret,
  NetworkMapModel,
  SecretModel,
  StorageMapModel,
  type V1beta1Hook,
  type V1beta1NetworkMap,
  type V1beta1StorageMap,
} from '@forklift-ui/types';
import { ConfigMapModel } from '@utils/analytics/constants';
import type { ObjectRef } from '@utils/helpers/getObjectRef';

import { addOwnerRefs } from './addOwnerRefs';

export const addPlanResourceOwnerRefs = async (
  resources: {
    networkMap: V1beta1NetworkMap;
    storageMap: V1beta1StorageMap;
    secret?: IoK8sApiCoreV1Secret;
    hooks: { preHook?: V1beta1Hook; postHook?: V1beta1Hook };
    scriptsConfigMap?: IoK8sApiCoreV1ConfigMap;
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

  if (resources.scriptsConfigMap) {
    ownerRefRequests.push(addOwnerRefs(ConfigMapModel, resources.scriptsConfigMap, [planRef]));
  }

  await Promise.all(ownerRefRequests);
};

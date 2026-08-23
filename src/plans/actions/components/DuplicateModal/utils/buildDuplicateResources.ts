import { addOwnerRefs } from 'src/plans/create/utils/addOwnerRefs';

import type {
  IoK8sApiCoreV1ConfigMap,
  V1beta1Hook,
  V1beta1NetworkMap,
  V1beta1Plan,
  V1beta1PlanSpecVms,
  V1beta1StorageMap,
} from '@forklift-ui/types';
import { HookModel, NetworkMapModel, StorageMapModel } from '@forklift-ui/types';
import { ConfigMapModel } from '@utils/constants';
import { getAnnotations, getName, getNamespace } from '@utils/crds/common/selectors';
import { getRandomChars } from '@utils/crds/common/utils';
import { getPlanVirtualMachines } from '@utils/crds/plans/selectors';
import { isEmpty } from '@utils/helpers';
import type { ObjectRef } from '@utils/helpers/getObjectRef';

type OwnerRefResources = {
  configMap?: IoK8sApiCoreV1ConfigMap;
  networkMap: V1beta1NetworkMap;
  postHook?: V1beta1Hook;
  preHook?: V1beta1Hook;
  storageMap: V1beta1StorageMap;
};

export const buildDuplicateHook = (
  hook: V1beta1Hook,
  planName: string,
  hookType: 'pre' | 'post',
  namespace: string,
): V1beta1Hook => ({
  apiVersion: 'forklift.konveyor.io/v1beta1',
  kind: 'Hook',
  metadata: {
    name: `${planName}-${hookType}-hook-${getRandomChars(5)}`,
    namespace,
    ...(getAnnotations(hook) && { annotations: getAnnotations(hook) }),
  },
  spec: { ...hook.spec },
});

export const buildDuplicateConfigMap = (
  configMap: IoK8sApiCoreV1ConfigMap,
  planName: string,
  namespace: string,
): IoK8sApiCoreV1ConfigMap => ({
  apiVersion: 'v1',
  data: configMap.data,
  kind: 'ConfigMap',
  metadata: {
    name: `${planName}-scripts-${getRandomChars(5)}`,
    namespace,
  },
});

export const buildUpdatedVmsWithHooks = (
  plan: V1beta1Plan,
  newPreHook?: V1beta1Hook,
  newPostHook?: V1beta1Hook,
): V1beta1PlanSpecVms[] => {
  const vms = getPlanVirtualMachines(plan);

  if (!newPreHook && !newPostHook) {
    return vms;
  }

  return vms.map((vm) => {
    if (isEmpty(vm.hooks)) {
      return vm;
    }

    const updatedHooks = (vm.hooks ?? []).map((hookEntry) => {
      if (hookEntry.step === 'PreHook' && newPreHook) {
        return {
          ...hookEntry,
          hook: { name: getName(newPreHook), namespace: getNamespace(newPreHook) },
        };
      }

      if (hookEntry.step === 'PostHook' && newPostHook) {
        return {
          ...hookEntry,
          hook: { name: getName(newPostHook), namespace: getNamespace(newPostHook) },
        };
      }

      return hookEntry;
    });

    return { ...vm, hooks: updatedHooks };
  });
};

export const addOwnerRefsToResources = async (
  planRef: ObjectRef,
  resources: OwnerRefResources,
): Promise<void> => {
  const requests: ReturnType<typeof addOwnerRefs>[] = [
    addOwnerRefs(NetworkMapModel, resources.networkMap, [planRef]),
    addOwnerRefs(StorageMapModel, resources.storageMap, [planRef]),
  ];

  if (resources.preHook) {
    requests.push(addOwnerRefs(HookModel, resources.preHook, [planRef]));
  }

  if (resources.postHook) {
    requests.push(addOwnerRefs(HookModel, resources.postHook, [planRef]));
  }

  if (resources.configMap) {
    requests.push(addOwnerRefs(ConfigMapModel, resources.configMap, [planRef]));
  }

  await Promise.all(requests);
};

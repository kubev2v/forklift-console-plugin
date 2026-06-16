import { addOwnerRefs } from 'src/plans/create/utils/addOwnerRefs';

import type {
  IoK8sApiCoreV1ConfigMap,
  V1beta1Hook,
  V1beta1NetworkMap,
  V1beta1Plan,
  V1beta1PlanSpecMap,
  V1beta1PlanSpecVms,
  V1beta1StorageMap,
} from '@forklift-ui/types';
import { HookModel, NetworkMapModel, PlanModel, StorageMapModel } from '@forklift-ui/types';
import { k8sCreate } from '@openshift-console/dynamic-plugin-sdk';
import { ConfigMapModel } from '@utils/constants';
import { getAnnotations, getName, getNamespace, getUID } from '@utils/crds/common/selectors';
import { getRandomChars } from '@utils/crds/common/utils';
import { getPlanVirtualMachines } from '@utils/crds/plans/selectors';
import { isEmpty } from '@utils/helpers';
import type { ObjectRef } from '@utils/helpers/getObjectRef';

type CreateDuplicatePlanParams = {
  configMap?: IoK8sApiCoreV1ConfigMap;
  networkMap: V1beta1NetworkMap;
  newPlanName: string;
  plan: V1beta1Plan;
  postHook?: V1beta1Hook;
  preHook?: V1beta1Hook;
  storageMap: V1beta1StorageMap;
};

type OwnerRefResources = {
  configMap?: IoK8sApiCoreV1ConfigMap;
  networkMap: V1beta1NetworkMap;
  postHook?: V1beta1Hook;
  preHook?: V1beta1Hook;
  storageMap: V1beta1StorageMap;
};

const buildDuplicateHook = (
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

const buildDuplicateConfigMap = (
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

const buildUpdatedVmsWithHooks = (
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

    const updatedHooks = vm.hooks!.map((hookEntry) => {
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

const addOwnerRefsToResources = async (
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

export const createDuplicatePlanAndMapResources = async ({
  configMap,
  networkMap,
  newPlanName,
  plan,
  postHook,
  preHook,
  storageMap,
}: CreateDuplicatePlanParams): Promise<V1beta1Plan> => {
  const namespace = getNamespace(plan) ?? '';

  const vmHooks = getPlanVirtualMachines(plan).flatMap((vm) => vm.hooks ?? []);
  const hasPreHookRef = vmHooks.some((entry) => entry.step === 'PreHook');
  const hasPostHookRef = vmHooks.some((entry) => entry.step === 'PostHook');
  const hasScriptsRef = !isEmpty(plan.spec?.customizationScripts?.name);

  if (hasPreHookRef && !preHook) {
    throw new Error('Plan references a PreHook but it was not resolved for duplication.');
  }
  if (hasPostHookRef && !postHook) {
    throw new Error('Plan references a PostHook but it was not resolved for duplication.');
  }
  if (hasScriptsRef && !configMap) {
    throw new Error('Plan references customization scripts but ConfigMap was not resolved.');
  }

  const newPreHook = preHook
    ? await k8sCreate({
        data: buildDuplicateHook(preHook, newPlanName, 'pre', namespace),
        model: HookModel,
      })
    : undefined;

  const newPostHook = postHook
    ? await k8sCreate({
        data: buildDuplicateHook(postHook, newPlanName, 'post', namespace),
        model: HookModel,
      })
    : undefined;

  const newConfigMap = configMap
    ? await k8sCreate({
        data: buildDuplicateConfigMap(configMap, newPlanName, namespace),
        model: ConfigMapModel,
      })
    : undefined;

  const newNetworkMapData: V1beta1NetworkMap = {
    apiVersion: 'forklift.konveyor.io/v1beta1',
    kind: 'NetworkMap',
    metadata: {
      name: `${newPlanName}-${getRandomChars(5)}`,
      namespace,
    },
    spec: networkMap.spec,
  };

  const newStorageMapData: V1beta1StorageMap = {
    apiVersion: 'forklift.konveyor.io/v1beta1',
    kind: 'StorageMap',
    metadata: {
      name: `${newPlanName}-${getRandomChars(5)}`,
      namespace,
    },
    spec: storageMap.spec,
  };

  const createdNetworkMap = await k8sCreate({ data: newNetworkMapData, model: NetworkMapModel });
  const createdStorageMap = await k8sCreate({ data: newStorageMapData, model: StorageMapModel });

  const mappings: V1beta1PlanSpecMap = {
    network: {
      name: getName(createdNetworkMap),
      namespace: getNamespace(createdNetworkMap),
    },
    storage: {
      name: getName(createdStorageMap),
      namespace: getNamespace(createdStorageMap),
    },
  };

  const vms = buildUpdatedVmsWithHooks(plan, newPreHook, newPostHook);

  const newPlanData: V1beta1Plan = {
    apiVersion: 'forklift.konveyor.io/v1beta1',
    kind: 'Plan',
    metadata: {
      name: newPlanName,
      namespace,
    },
    spec: {
      ...plan.spec!,
      archived: false,
      customizationScripts: newConfigMap
        ? { name: getName(newConfigMap), namespace: getNamespace(newConfigMap) }
        : undefined,
      map: mappings,
      vms,
    },
  };

  if (!newConfigMap) {
    delete newPlanData.spec!.customizationScripts;
  }

  const createdPlan = await k8sCreate({ data: newPlanData, model: PlanModel });

  const planRef: ObjectRef = {
    apiVersion: createdPlan.apiVersion,
    kind: createdPlan.kind,
    name: getName(createdPlan)!,
    namespace: getNamespace(createdPlan),
    uid: getUID(createdPlan)!,
  };

  await addOwnerRefsToResources(planRef, {
    configMap: newConfigMap,
    networkMap: createdNetworkMap,
    postHook: newPostHook,
    preHook: newPreHook,
    storageMap: createdStorageMap,
  });

  return createdPlan;
};

import type {
  IoK8sApiCoreV1ConfigMap,
  V1beta1Hook,
  V1beta1NetworkMap,
  V1beta1Plan,
  V1beta1PlanSpecMap,
  V1beta1StorageMap,
} from '@forklift-ui/types';
import { HookModel, NetworkMapModel, PlanModel, StorageMapModel } from '@forklift-ui/types';
import { k8sCreate } from '@openshift-console/dynamic-plugin-sdk';
import { ConfigMapModel } from '@utils/constants';
import { getName, getNamespace, getUID } from '@utils/crds/common/selectors';
import { getRandomChars } from '@utils/crds/common/utils';
import { getPlanVirtualMachines } from '@utils/crds/plans/selectors';
import { isEmpty } from '@utils/helpers';
import type { ObjectRef } from '@utils/helpers/getObjectRef';

import {
  addOwnerRefsToResources,
  buildDuplicateConfigMap,
  buildDuplicateHook,
  buildUpdatedVmsWithHooks,
} from './buildDuplicateResources';

type CreateDuplicatePlanParams = {
  configMap?: IoK8sApiCoreV1ConfigMap;
  networkMap: V1beta1NetworkMap;
  newPlanName: string;
  plan: V1beta1Plan;
  postHook?: V1beta1Hook;
  preHook?: V1beta1Hook;
  storageMap: V1beta1StorageMap;
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

  const planSpec = plan.spec;
  if (!planSpec) {
    throw new Error('Plan spec is required for duplication.');
  }

  const newPlanData: V1beta1Plan = {
    apiVersion: 'forklift.konveyor.io/v1beta1',
    kind: 'Plan',
    metadata: {
      name: newPlanName,
      namespace,
    },
    spec: {
      ...planSpec,
      archived: false,
      customizationScripts: newConfigMap
        ? { name: getName(newConfigMap), namespace: getNamespace(newConfigMap) }
        : undefined,
      map: mappings,
      vms,
    },
  };

  if (!newConfigMap && newPlanData.spec) {
    delete newPlanData.spec.customizationScripts;
  }

  const createdPlan = await k8sCreate({ data: newPlanData, model: PlanModel });

  const planRef: ObjectRef = {
    apiVersion: createdPlan.apiVersion,
    kind: createdPlan.kind,
    name: getName(createdPlan) ?? '',
    namespace: getNamespace(createdPlan),
    uid: getUID(createdPlan) ?? '',
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

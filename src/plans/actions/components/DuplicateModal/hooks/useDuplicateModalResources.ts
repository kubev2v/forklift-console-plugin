import { CONFIG_MAP_GVK } from 'src/plans/create/steps/customization-scripts/constants';

import {
  HookModelGroupVersionKind,
  type IoK8sApiCoreV1ConfigMap,
  NetworkMapModelGroupVersionKind,
  StorageMapModelGroupVersionKind,
  type V1beta1Hook,
  type V1beta1NetworkMap,
  type V1beta1Plan,
  type V1beta1StorageMap,
} from '@forklift-ui/types';
import { getNamespace } from '@utils/crds/common/selectors';
import {
  getPlanNetworkMapName,
  getPlanNetworkMapNamespace,
  getPlanStorageMapName,
  getPlanStorageMapNamespace,
  getPlanVirtualMachines,
} from '@utils/crds/plans/selectors';
import { isEmpty } from '@utils/helpers';
import { useK8sWatchResource } from '@utils/hooks/useK8sWatchResource';

const getPlanHookNames = (plan: V1beta1Plan): { postHookName?: string; preHookName?: string } => {
  const allHooks = getPlanVirtualMachines(plan).flatMap((vm) => vm.hooks ?? []);

  if (isEmpty(allHooks)) {
    return {};
  }

  const preHookName = allHooks.find((hook) => hook.step === 'PreHook')?.hook?.name;
  const postHookName = allHooks.find((hook) => hook.step === 'PostHook')?.hook?.name;

  return { postHookName, preHookName };
};

type UseDuplicateModalResourcesResult = {
  configMap: IoK8sApiCoreV1ConfigMap | undefined;
  networkMap: V1beta1NetworkMap | undefined;
  postHook: V1beta1Hook | undefined;
  preHook: V1beta1Hook | undefined;
  storageMap: V1beta1StorageMap | undefined;
};

export const useDuplicateModalResources = (plan: V1beta1Plan): UseDuplicateModalResourcesResult => {
  const networkMapName = getPlanNetworkMapName(plan);
  const [networkMap] = useK8sWatchResource<V1beta1NetworkMap>(
    networkMapName
      ? {
          groupVersionKind: NetworkMapModelGroupVersionKind,
          isList: false,
          name: networkMapName,
          namespace: getPlanNetworkMapNamespace(plan),
          namespaced: true,
        }
      : null,
  );

  const storageMapName = getPlanStorageMapName(plan);
  const [storageMap] = useK8sWatchResource<V1beta1StorageMap>(
    storageMapName
      ? {
          groupVersionKind: StorageMapModelGroupVersionKind,
          isList: false,
          name: storageMapName,
          namespace: getPlanStorageMapNamespace(plan),
          namespaced: true,
        }
      : null,
  );

  const { postHookName, preHookName } = getPlanHookNames(plan);
  const planNamespace = getNamespace(plan);

  const [preHook] = useK8sWatchResource<V1beta1Hook>(
    preHookName
      ? {
          groupVersionKind: HookModelGroupVersionKind,
          isList: false,
          name: preHookName,
          namespace: planNamespace,
          namespaced: true,
        }
      : null,
  );

  const [postHook] = useK8sWatchResource<V1beta1Hook>(
    postHookName
      ? {
          groupVersionKind: HookModelGroupVersionKind,
          isList: false,
          name: postHookName,
          namespace: planNamespace,
          namespaced: true,
        }
      : null,
  );

  const scriptsRef = plan?.spec?.customizationScripts;
  const [configMap] = useK8sWatchResource<IoK8sApiCoreV1ConfigMap>(
    scriptsRef?.name
      ? {
          groupVersionKind: CONFIG_MAP_GVK,
          isList: false,
          name: scriptsRef.name,
          namespace: scriptsRef.namespace,
          namespaced: true,
        }
      : null,
  );

  return { configMap, networkMap, postHook, preHook, storageMap };
};

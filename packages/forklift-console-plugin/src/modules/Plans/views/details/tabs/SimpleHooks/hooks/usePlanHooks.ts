import {
  HookModelGroupVersionKind,
  PlanModelGroupVersionKind,
  V1beta1Hook,
  V1beta1Plan,
  V1beta1PlanSpecVmsHooks,
} from '@kubev2v/types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

export const usePlanHooks = (name: string, namespace: string) => {
  const [plan, loaded, loadError] = useK8sWatchResource<V1beta1Plan>({
    groupVersionKind: PlanModelGroupVersionKind,
    namespaced: true,
    name,
    namespace,
  });
  const hooks: V1beta1PlanSpecVmsHooks[] = plan?.spec?.vms?.[0]?.hooks || [];
  const postHook = hooks.find((h) => h.step === 'PostHook');
  const preHook = hooks.find((h) => h.step === 'PreHook');

  const [hookRecourses] = useK8sWatchResource<V1beta1Hook[]>({
    groupVersionKind: HookModelGroupVersionKind,
    namespaced: true,
    isList: true,
    namespace: plan?.metadata?.namespace,
  });

  const postHookResource = hookRecourses.find((h) => h.metadata.name === postHook?.hook?.name);
  const preHookResource = hookRecourses.find((h) => h.metadata.name === preHook?.hook?.name);

  return [plan, preHookResource, postHookResource, loaded, loadError];
};

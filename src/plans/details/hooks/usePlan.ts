import { PlanModelGroupVersionKind, type V1beta1Plan } from '@forklift-ui/types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

type UsePlan = (
  name: string,
  namespace: string,
) => {
  loaded: boolean;
  loadError: Error | null;
  plan: V1beta1Plan;
};

export const usePlan: UsePlan = (name, namespace) => {
  const [plan, loaded, loadError] = useK8sWatchResource<V1beta1Plan>({
    groupVersionKind: PlanModelGroupVersionKind,
    name,
    namespace,
    namespaced: true,
  });

  return {
    loaded,
    loadError,
    plan,
  };
};

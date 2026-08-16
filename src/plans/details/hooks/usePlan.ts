import { PlanModelGroupVersionKind, type V1beta1Plan } from '@forklift-ui/types';
import { useTypedK8sWatchResource } from '@utils/hooks/useTypedK8sWatchResource';

type UsePlan = (
  name: string,
  namespace: string,
) => {
  loaded: boolean;
  loadError: Error | null;
  plan: V1beta1Plan;
};

export const usePlan: UsePlan = (name, namespace) => {
  const [plan, loaded, loadError] = useTypedK8sWatchResource<V1beta1Plan>({
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

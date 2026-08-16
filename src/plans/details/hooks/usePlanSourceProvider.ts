import {
  ProviderModelGroupVersionKind,
  type V1beta1Plan,
  type V1beta1Provider,
} from '@forklift-ui/types';
import { getPlanSourceProvider } from '@utils/crds/plans/selectors';
import { useTypedK8sWatchResource } from '@utils/hooks/useTypedK8sWatchResource';

type UsePlanSourceProvider = (plan: V1beta1Plan) => {
  loaded: boolean;
  loadError: Error | null;
  sourceProvider: V1beta1Provider;
};

const usePlanSourceProvider: UsePlanSourceProvider = (plan) => {
  const { name, namespace } = getPlanSourceProvider(plan);

  const [sourceProvider, loaded, loadError] = useTypedK8sWatchResource<V1beta1Provider>({
    groupVersionKind: ProviderModelGroupVersionKind,
    isList: false,
    name,
    namespace,
    namespaced: true,
  });

  return {
    loaded,
    loadError,
    sourceProvider,
  };
};

export default usePlanSourceProvider;

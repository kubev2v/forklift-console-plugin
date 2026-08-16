import {
  ProviderModelGroupVersionKind,
  type V1beta1Plan,
  type V1beta1Provider,
} from '@forklift-ui/types';
import { getPlanDestinationProvider } from '@utils/crds/plans/selectors';
import { useTypedK8sWatchResource } from '@utils/hooks/useTypedK8sWatchResource';

type UsePlanDestinationProvider = (plan: V1beta1Plan) => {
  destinationProvider: V1beta1Provider;
  loaded: boolean;
  loadError: Error | null;
};
const usePlanDestinationProvider: UsePlanDestinationProvider = (plan) => {
  const { name: destinationName, namespace: destinationNamespace } =
    getPlanDestinationProvider(plan);
  const [destinationProvider, loaded, loadError] = useTypedK8sWatchResource<V1beta1Provider>({
    groupVersionKind: ProviderModelGroupVersionKind,
    isList: false,
    name: destinationName,
    namespace: destinationNamespace,
    namespaced: true,
  });

  return {
    destinationProvider,
    loaded,
    loadError,
  };
};

export default usePlanDestinationProvider;

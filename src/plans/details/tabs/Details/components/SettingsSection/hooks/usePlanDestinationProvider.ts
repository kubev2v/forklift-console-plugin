import {
  ProviderModelGroupVersionKind,
  type V1beta1Plan,
  type V1beta1Provider,
} from '@kubev2v/types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { getPlanDestinationProvider } from '@utils/crds/plans/selectors';

type UsePlanDestinationProvider = (plan: V1beta1Plan) => {
  destinationProvider: V1beta1Provider;
  loaded: boolean;
  loadError: Error;
};
const usePlanDestinationProvider: UsePlanDestinationProvider = (plan) => {
  const { name: destinationName, namespace: destinationNamespace } =
    getPlanDestinationProvider(plan);
  const [destinationProvider, loaded, loadError] = useK8sWatchResource<V1beta1Provider>({
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

import {
  ProviderModelGroupVersionKind,
  type V1beta1Plan,
  type V1beta1Provider,
} from '@kubev2v/types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { getPlanSourceProvider } from '@utils/crds/plans/selectors';

type UsePlanSourceProvider = (plan: V1beta1Plan) => {
  sourceProvider: V1beta1Provider;
  loaded: boolean;
  loadError: Error;
};

const usePlanSourceProvider: UsePlanSourceProvider = (plan) => {
  const { name, namespace } = getPlanSourceProvider(plan);

  const [sourceProvider, loaded, loadError] = useK8sWatchResource<V1beta1Provider>({
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

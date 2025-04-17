import { getPlanPhase } from 'src/modules/Plans/utils/helpers/getPlanPhase';
import { useSourceNetworks } from 'src/modules/Providers/hooks/useNetworks';
import usePlanProviders from 'src/modules/Providers/hooks/usePlanSourceProvider';
import { useSourceStorages } from 'src/modules/Providers/hooks/useStorages';

import {
  NetworkMapModelGroupVersionKind,
  StorageMapModelGroupVersionKind,
  type V1beta1NetworkMap,
  type V1beta1Plan,
  type V1beta1StorageMap,
} from '@kubev2v/types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { getNamespace } from '@utils/crds/common/selectors';

import { CRITICAL } from '../utils/constants';

const usePlanAlerts = (plan: V1beta1Plan) => {
  const namespace = getNamespace(plan);
  const planPhase = getPlanPhase({ plan });

  const [networkMaps, networkMapsLoaded, networkMapsError] = useK8sWatchResource<
    V1beta1NetworkMap[]
  >({
    groupVersionKind: NetworkMapModelGroupVersionKind,
    isList: true,
    namespace,
    namespaced: true,
  });

  const [storageMaps] = useK8sWatchResource<V1beta1StorageMap[]>({
    groupVersionKind: StorageMapModelGroupVersionKind,
    isList: true,
    namespace,
    namespaced: true,
  });

  const [sourceProvider] = usePlanProviders(plan, namespace!);
  const [sourceStorages] = useSourceStorages(sourceProvider);
  const [sourceNetworks] = useSourceNetworks(sourceProvider);

  const criticalCondition = plan?.status?.conditions?.find(
    (condition) => condition?.category === CRITICAL,
  );

  return {
    criticalCondition,
    networkMaps,
    networkMapsError,
    networkMapsLoaded,
    planPhase,
    sourceNetworks,
    sourceStorages,
    storageMaps,
  };
};

export default usePlanAlerts;

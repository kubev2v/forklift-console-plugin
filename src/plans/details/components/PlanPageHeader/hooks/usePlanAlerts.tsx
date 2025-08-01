import { useMemo } from 'react';
import { useSourceNetworks } from 'src/modules/Providers/hooks/useNetworks';
import usePlanProviders from 'src/modules/Providers/hooks/usePlanSourceProvider';
import { useSourceStorages } from 'src/modules/Providers/hooks/useStorages';
import { POD } from 'src/plans/details/utils/constants';

import {
  NetworkMapModelGroupVersionKind,
  StorageMapModelGroupVersionKind,
  type V1beta1NetworkMap,
  type V1beta1Plan,
  type V1beta1StorageMap,
} from '@kubev2v/types';
import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';
import { CATEGORY_TYPES } from '@utils/constants';
import { getName, getNamespace } from '@utils/crds/common/selectors';
import { getPlanNetworkMapName, getPlanPreserveIP } from '@utils/crds/plans/selectors';
import { isEmpty } from '@utils/helpers';

import { getPlanStatus } from '../../PlanStatus/utils/utils';

const usePlanAlerts = (plan: V1beta1Plan) => {
  const namespace = getNamespace(plan);
  const status = getPlanStatus(plan);

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
    (condition) => condition?.category === CATEGORY_TYPES.CRITICAL,
  );

  const showPreserveIPWarning = useMemo(() => {
    if (!networkMapsLoaded || networkMapsError) {
      return false;
    }

    const isPreserveStaticIPs = getPlanPreserveIP(plan);
    const networkMap = networkMaps.find((net) => getName(net) === getPlanNetworkMapName(plan));
    const isMapToPod =
      networkMap?.spec?.map.some((entry) => entry.destination.type === POD) ?? false;

    return Boolean(isPreserveStaticIPs && isMapToPod);
  }, [networkMapsError, networkMapsLoaded, networkMaps, plan]);

  const showCriticalCondition = !isEmpty(criticalCondition);

  return {
    criticalCondition,
    networkMaps,
    networkMapsError,
    networkMapsLoaded,
    showCriticalCondition,
    showPreserveIPWarning,
    sourceNetworks,
    sourceStorages,
    status,
    storageMaps,
  };
};

export default usePlanAlerts;

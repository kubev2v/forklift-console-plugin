import { useMemo } from 'react';
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
import { CATEGORY_TYPES } from '@utils/constants';
import { getNamespace } from '@utils/crds/common/selectors';
import { isEmpty } from '@utils/helpers';

import { usePlanMappingData } from '../../../hooks/usePlanMappingData';
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
  const [providerStorages] = useSourceStorages(sourceProvider);
  const [providerNetworks] = useSourceNetworks(sourceProvider);

  const { sourceNetworks, sourceStorages } = usePlanMappingData({
    networkMaps,
    plan,
    providerNetworks,
    providerStorages,
    sourceProvider,
    storageMaps,
  });

  const criticalCondition = plan?.status?.conditions?.find(
    (condition) => condition?.category === CATEGORY_TYPES.CRITICAL,
  );

  const showCriticalCondition = !isEmpty(criticalCondition);

  const preserveIPWarningsConditions = plan?.status?.conditions?.filter(
    (condition) =>
      condition?.category === CATEGORY_TYPES.WARNING &&
      (condition?.type === 'NetMapPreservingIPsOnPodNetwork' ||
        condition?.type === 'VMMissingGuestIPs' ||
        condition?.type === 'VMIpNotMatchingUdnSubnet'),
  );

  const showPreserveIPWarningsConditions = !isEmpty(preserveIPWarningsConditions);

  return {
    criticalCondition,
    networkMaps,
    networkMapsError,
    networkMapsLoaded,
    preserveIPWarningsConditions,
    showCriticalCondition,
    showPreserveIPWarningsConditions,
    sourceNetworks,
    sourceStorages,
    status,
    storageMaps,
  };
};

export default usePlanAlerts;

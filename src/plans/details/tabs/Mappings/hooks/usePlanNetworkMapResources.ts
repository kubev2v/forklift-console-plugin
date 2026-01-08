import { useMemo } from 'react';
import {
  type InventoryNetwork,
  useOpenShiftNetworks,
  useSourceNetworks,
} from 'src/modules/Providers/hooks/useNetworks';
import { getNetworkMappingValues } from 'src/networkMaps/create/utils/buildNetworkMappings';
import { useOvirtNicProfiles } from 'src/plans/create/hooks/useOvirtNicProfiles';
import type { NetworkMapping } from 'src/plans/create/steps/network-map/constants';

import {
  NetworkMapModelGroupVersionKind,
  type OpenShiftNetworkAttachmentDefinition,
  type OVirtNicProfile,
  type V1beta1NetworkMap,
  type V1beta1Plan,
  type V1beta1Provider,
} from '@kubev2v/types';
import { useK8sWatchResource, type WatchK8sResult } from '@openshift-console/dynamic-plugin-sdk';
import { getPlanNetworkMapName, getPlanNetworkMapNamespace } from '@utils/crds/plans/selectors';

type UsePlanNetworkMapResourcesParams = {
  sourceProvider: V1beta1Provider;
  targetProvider: V1beta1Provider;
  plan: V1beta1Plan;
};

type UsePlanNetworkMapResources = ({
  plan,
  sourceProvider,
  targetProvider,
}: UsePlanNetworkMapResourcesParams) => {
  networkMappings: NetworkMapping[];
  networkMapResult: WatchK8sResult<V1beta1NetworkMap>;
  oVirtNicProfilesResult: [OVirtNicProfile[], boolean, Error | null];
  sourceNetworksResult: [InventoryNetwork[], boolean, Error | null];
  targetNetworksResult: [OpenShiftNetworkAttachmentDefinition[], boolean, Error | null];
};

export const usePlanNetworkMapResources: UsePlanNetworkMapResources = ({
  plan,
  sourceProvider,
  targetProvider,
}) => {
  const networkMapResult = useK8sWatchResource<V1beta1NetworkMap>({
    groupVersionKind: NetworkMapModelGroupVersionKind,
    isList: false,
    name: getPlanNetworkMapName(plan),
    namespace: getPlanNetworkMapNamespace(plan),
  });

  const sourceNetworksResult = useSourceNetworks(sourceProvider);
  const targetNetworksResult = useOpenShiftNetworks(targetProvider);
  const oVirtNicProfilesResult = useOvirtNicProfiles(sourceProvider);

  const [networkMap] = networkMapResult ?? [];
  const [sourceNetworks] = sourceNetworksResult ?? [];
  const [targetNetworks] = targetNetworksResult ?? [];

  const networkMappings = useMemo(
    () =>
      getNetworkMappingValues(
        networkMap?.spec?.map,
        sourceProvider,
        sourceNetworks,
        targetNetworks,
      ) ?? [],
    [networkMap?.spec?.map, sourceProvider, sourceNetworks, targetNetworks],
  );

  return {
    networkMappings,
    networkMapResult,
    oVirtNicProfilesResult,
    sourceNetworksResult,
    targetNetworksResult,
  };
};

import { useMemo } from 'react';
import {
  filterTargetNetworksByProject,
  getSourceNetworkValues,
} from 'src/plans/create/steps/network-map/utils';
import { getSourceStorageValuesForSelectedVms } from 'src/storageMaps/utils/getSourceStorageValues';

import { getPlanTargetNamespace } from '@utils/crds/plans/selectors';
import { isEmpty } from '@utils/helpers';

import { usePlan } from '../../../hooks/usePlan';
import { getMappingPageMessage } from '../utils/utils';

import type { UsePlanMappingsPageData } from './usePlanMappingsPageData.types';
import { usePlanMappingVms } from './usePlanMappingVms';
import { usePlanNetworkMapResources } from './usePlanNetworkMapResources';
import { usePlanProviders } from './usePlanProviders';
import { usePlanStorageMapResources } from './usePlanStorageMapResources';

export const usePlanMappingsPageData: UsePlanMappingsPageData = (name, namespace) => {
  const { plan } = usePlan(name, namespace);
  const { sourceProvider, targetProvider } = usePlanProviders(plan);
  const targetProject = useMemo(() => getPlanTargetNamespace(plan) ?? '', [plan]);
  const [vms, vmsLoading, vmsError] = usePlanMappingVms(plan, sourceProvider);

  const {
    networkMappings,
    networkMapResult: [networkMap, networkMapLoaded, networkMapLoadError],
    oVirtNicProfilesResult: [oVirtNicProfiles, oVirtNicProfilesLoading],
    sourceNetworksResult: [availableSourceNetworks, sourceNetworksLoading, sourceNetworksError],
    targetNetworksResult: [availableTargetNetworks, targetNetworksLoading, targetNetworksError],
  } = usePlanNetworkMapResources({ plan, sourceProvider, targetProvider });

  const {
    sourceStoragesResult: [availableSourceStorages, sourceStoragesLoading, sourceStoragesLoadError],
    storageMappings,
    storageMapResult: [storageMap, storageMapLoaded, storageMapLoadError],
    targetStoragesResult: [availableTargetStorages, targetStoragesLoading, targetStoragesLoadError],
    vmsWithDisksResult: [vmsWithDisks],
  } = usePlanStorageMapResources({
    plan,
    sourceProvider,
    targetProvider,
    vms,
  });

  const isLoading = useMemo(
    () =>
      sourceNetworksLoading ||
      targetNetworksLoading ||
      oVirtNicProfilesLoading ||
      sourceStoragesLoading ||
      targetStoragesLoading ||
      vmsLoading,
    [
      sourceNetworksLoading,
      targetNetworksLoading,
      oVirtNicProfilesLoading,
      sourceStoragesLoading,
      targetStoragesLoading,
      vmsLoading,
    ],
  );

  const { other: otherSourceNetworks, used: usedSourceNetworks } = useMemo(
    () => getSourceNetworkValues(availableSourceNetworks, Object.values(vms), oVirtNicProfiles),
    [availableSourceNetworks, oVirtNicProfiles, vms],
  );

  const { other: otherSourceStorages, used: usedSourceStorages } = useMemo(
    () =>
      getSourceStorageValuesForSelectedVms(sourceProvider, availableSourceStorages, vmsWithDisks),
    [availableSourceStorages, sourceProvider, vmsWithDisks],
  );

  const targetNetworksMap = useMemo(
    () => filterTargetNetworksByProject(availableTargetNetworks, targetProject),
    [availableTargetNetworks, targetProject],
  );

  const message = useMemo(
    () =>
      getMappingPageMessage({
        loadingResources: !networkMapLoaded || !storageMapLoaded,
        networkMapsEmpty: isEmpty(networkMap),
        resourcesError: networkMapLoadError ?? storageMapLoadError ?? vmsError,
        storageMapsEmpty: isEmpty(storageMap),
      }),
    [
      networkMap,
      networkMapLoaded,
      networkMapLoadError,
      storageMap,
      storageMapLoaded,
      storageMapLoadError,
      vmsError,
    ],
  );

  return {
    availableSourceStorages,
    availableTargetStorages,
    isLoading,
    message,
    networkMap,
    networkMappings,
    otherSourceNetworks,
    otherSourceStorages,
    oVirtNicProfiles,
    plan,
    sourceNetworksError,
    sourceProvider,
    sourceStoragesLoadError,
    sourceStoragesLoading,
    storageMap,
    storageMappings,
    targetNetworksError,
    targetNetworksMap,
    targetStoragesLoadError,
    targetStoragesLoading,
    usedSourceNetworks,
    usedSourceStorages,
    vms,
  };
};

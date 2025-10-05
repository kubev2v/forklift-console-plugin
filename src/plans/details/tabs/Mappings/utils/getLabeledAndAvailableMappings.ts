import { universalComparator } from 'src/components/common/TableView/sort';
import type { InventoryNetwork } from 'src/modules/Providers/hooks/useNetworks';
import type { InventoryStorage } from 'src/modules/Providers/hooks/useStorages';

import type {
  OpenShiftNetworkAttachmentDefinition,
  OpenShiftStorageClass,
  V1beta1NetworkMapSpecMap,
  V1beta1Plan,
  V1beta1StorageMapSpecMap,
} from '@kubev2v/types';
import { t } from '@utils/i18n';

import {
  mapSourceNetworksIdsToLabels,
  mapSourceStoragesIdsToLabels,
  mapTargetNetworksIdsToLabels,
  mapTargetStoragesLabelsToIds,
} from './mapMappingsIdsToLabels';
import type { Mapping } from './types';

type GetMappingsParams = {
  updatedNetwork: V1beta1NetworkMapSpecMap[];
  updatedStorage: V1beta1StorageMapSpecMap[];
  sourceNetworks: InventoryNetwork[];
  sourceStorages: InventoryStorage[];
  targetNetworks: OpenShiftNetworkAttachmentDefinition[];
  targetStorages: OpenShiftStorageClass[];
  plan: V1beta1Plan;
};

export const getLabeledAndAvailableMappings = ({
  plan,
  sourceNetworks,
  sourceStorages,
  targetNetworks,
  targetStorages,
  updatedNetwork,
  updatedStorage,
}: GetMappingsParams) => {
  const labeledTargetNetworkMap = mapTargetNetworksIdsToLabels(targetNetworks, plan);
  const labeledNetworkMappings: Mapping[] = updatedNetwork.map((obj) => ({
    destination:
      labeledTargetNetworkMap[obj.destination?.type] ??
      `${obj.destination?.namespace}/${obj.destination?.name}`,
    source: mapSourceNetworksIdsToLabels(sourceNetworks)[obj.source.id ?? obj.source.type!],
  }));

  const labeledStorageMappings: Mapping[] = updatedStorage.map((obj) => ({
    destination: mapTargetStoragesLabelsToIds(targetStorages, plan)[obj.destination.storageClass]
      ? obj.destination.storageClass
      : t('Not available'),
    source: mapSourceStoragesIdsToLabels(sourceStorages)[obj.source.id!] ?? obj.source?.name,
  }));

  const availableNetworkSources = Object.values(
    mapSourceNetworksIdsToLabels(
      sourceNetworks.filter(
        (sourceNetwork) =>
          !updatedNetwork.find(
            (updatedNetworkMap) => updatedNetworkMap.source.id === sourceNetwork.id,
          ),
      ),
    ),
  ).sort((netA, netB) => universalComparator(netA, netB, 'en'));

  const availableNetworkTargets = Object.values(labeledTargetNetworkMap).sort((netA, netB) =>
    universalComparator(netA, netB, 'en'),
  );

  const availableStorageSources = Object.values(
    mapSourceStoragesIdsToLabels(
      sourceStorages.filter(
        (sourceStorage) =>
          !updatedStorage.find(
            (updateStorageMap) => updateStorageMap.source.id === sourceStorage.id,
          ),
      ),
    ),
  ).sort((storA, storB) => universalComparator(storA, storB, 'en'));

  const availableStorageTargets = Object.keys(
    mapTargetStoragesLabelsToIds(targetStorages, plan),
  ).sort((storA, storB) => universalComparator(storA, storB, 'en'));

  return {
    availableNetworkSources,
    availableNetworkTargets,
    availableStorageSources,
    availableStorageTargets,
    labeledNetworkMappings,
    labeledStorageMappings,
  };
};

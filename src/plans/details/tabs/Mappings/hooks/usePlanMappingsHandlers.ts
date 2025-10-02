import { useState } from 'react';
import type { InventoryNetwork } from 'src/modules/Providers/hooks/useNetworks';
import type { InventoryStorage } from 'src/modules/Providers/hooks/useStorages';
import { POD } from 'src/plans/details/utils/constants';
import { StorageClassAnnotation } from 'src/storageMaps/types';

import type {
  OpenShiftNetworkAttachmentDefinition,
  OpenShiftStorageClass,
  V1beta1NetworkMap,
  V1beta1StorageMap,
} from '@kubev2v/types';
import { CONDITION_STATUS } from '@utils/constants';

import { DefaultNetworkLabel, IgnoreNetwork, STANDARD } from '../utils/constants';
import {
  mapSourceNetworksIdsToLabels,
  mapSourceStoragesIdsToLabels,
} from '../utils/mapMappingsIdsToLabels';
import {
  createOnAddNetworkMapping,
  createOnAddStorageMapping,
  createOnDeleteMapping,
  createOnReplaceMapping,
  createReplacedNetworkMap,
  createReplacedStorageMap,
} from '../utils/planMappingsHandlers';
import type { Mapping } from '../utils/types';

import { usePlanMappingsState, type UsePlanMappingsStateResult } from './usePlanMappingState';

type PlanMappingsHandlers = {
  canAddNetwork: boolean;
  canAddStorage: boolean;
  onAddNetwork: () => void;
  onAddStorage: () => void;
  onDeleteNetwork: (mapping: Mapping) => void;
  onDeleteStorage: (mapping: Mapping) => void;
  onReplaceNetwork: ({ current, next }: { current: Mapping; next: Mapping }) => void;
  onReplaceStorage: ({ current, next }: { current: Mapping; next: Mapping }) => void;
} & UsePlanMappingsStateResult;

type PlanMappingsHandlersParams = {
  planNetworkMap: V1beta1NetworkMap;
  planStorageMap: V1beta1StorageMap;
  sourceNetworks: InventoryNetwork[];
  sourceStorages: InventoryStorage[];
  targetNetworks: OpenShiftNetworkAttachmentDefinition[];
  targetStorages: OpenShiftStorageClass[];
};

type UsePlanMappingsHandlers = (params: PlanMappingsHandlersParams) => PlanMappingsHandlers;

export const usePlanMappingsHandlers: UsePlanMappingsHandlers = ({
  planNetworkMap,
  planStorageMap,
  sourceNetworks,
  sourceStorages,
  targetNetworks,
  targetStorages,
}) => {
  const mappingsState = usePlanMappingsState(planNetworkMap, planStorageMap);
  const { setUpdatedNetwork, setUpdatedStorage, updatedNetwork, updatedStorage } = mappingsState;

  const [canAddNetwork, setCanAddNetwork] = useState(true);
  const [canAddStorage, setCanAddStorage] = useState(true);

  const onAddNetwork = () => {
    const { canAddMore, newState } = createOnAddNetworkMapping(updatedNetwork, sourceNetworks);
    setUpdatedNetwork(newState);
    setCanAddNetwork(canAddMore);
  };

  const onAddStorage = () => {
    const defaultStorageClass =
      targetStorages.find(
        (storage) =>
          storage?.object?.metadata?.annotations?.[StorageClassAnnotation.IsDefault] ===
          CONDITION_STATUS.TRUE.toLowerCase(),
      ) ?? targetStorages[0];
    const { canAddMore, newState } = createOnAddStorageMapping(
      updatedStorage,
      sourceStorages,
      defaultStorageClass,
    );
    setUpdatedStorage(newState);
    setCanAddStorage(canAddMore);
  };

  const onDeleteNetwork = (mapping: Mapping) => {
    const newState = createOnDeleteMapping(
      updatedNetwork,
      (item) =>
        mapSourceNetworksIdsToLabels(sourceNetworks)[item.source.id ?? item.source.type!] ===
          mapping.source ||
        item.destination.name === mapping.destination ||
        `${item.destination.namespace}/${item.destination.name}` === mapping.destination,
    );

    setUpdatedNetwork(newState);
    setCanAddNetwork(true);
  };

  const onDeleteStorage = (mapping: Mapping) => {
    const newState = createOnDeleteMapping(updatedStorage, (item) => {
      const sourceLabel = mapSourceStoragesIdsToLabels(sourceStorages)[item.source.id!];
      const sourceMatch = sourceLabel === mapping.source;
      const destMatch = item.destination.storageClass === mapping.destination;
      return sourceMatch && destMatch;
    });
    setUpdatedStorage(newState);
    setCanAddStorage(true);
  };

  const onReplaceNetwork = ({ current, next }: { current: Mapping; next: Mapping }) => {
    const source = sourceNetworks.find((sourceNetwork) => sourceNetwork.name === next.source);
    const target =
      targetNetworks.find(
        (targetNetwork) => `${targetNetwork.namespace}/${targetNetwork.name}` === next.destination,
      ) ?? next.destination;

    if (source) {
      const newMap = createReplacedNetworkMap(source, target);
      const newState = createOnReplaceMapping(
        updatedNetwork,
        (item) =>
          mapSourceNetworksIdsToLabels(sourceNetworks)[item.source.id ?? item.source.type!] ===
            current.source &&
          (item.destination.name === current.destination ||
            `${item.destination.namespace}/${item.destination.name}` === current.destination ||
            (current.destination === DefaultNetworkLabel.Source && item.destination.type === POD) ||
            (current.destination === IgnoreNetwork.Label &&
              item.destination.type === IgnoreNetwork.Type)),
        newMap,
      );
      setUpdatedNetwork(newState);
    }
  };

  const onReplaceStorage = ({ current, next }: { current: Mapping; next: Mapping }) => {
    const sourceLabelsToIds = mapSourceStoragesIdsToLabels(sourceStorages);
    const source = sourceStorages.find(
      (sourceStorage) => sourceLabelsToIds[sourceStorage.id] === next.source,
    );
    const target = targetStorages.find((targetStorage) => targetStorage.name === next.destination);

    if (source && (target || next.destination === STANDARD)) {
      const newMap = target
        ? createReplacedStorageMap(source, target)
        : {
            destination: { storageClass: STANDARD },
            source: { id: source.id, name: source.name, type: source.providerType },
          };
      const newState = createOnReplaceMapping(
        updatedStorage,
        (item) =>
          mapSourceStoragesIdsToLabels(sourceStorages)[item.source.id!] === current.source &&
          item.destination.storageClass === current.destination,
        newMap,
      );
      setUpdatedStorage(newState);
    }
  };

  return {
    canAddNetwork,
    canAddStorage,
    onAddNetwork,
    onAddStorage,
    onDeleteNetwork,
    onDeleteStorage,
    onReplaceNetwork,
    onReplaceStorage,
    ...mappingsState,
  };
};

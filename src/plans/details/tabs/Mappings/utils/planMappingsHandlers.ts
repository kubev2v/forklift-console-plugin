import type { InventoryNetwork } from 'src/modules/Providers/hooks/useNetworks';
import type { InventoryStorage } from 'src/modules/Providers/hooks/useStorages';
import { IGNORED, MULTUS, POD } from 'src/plans/details/utils/constants';

import type {
  OpenShiftNetworkAttachmentDefinition,
  OpenShiftStorageClass,
  V1beta1NetworkMapSpecMap,
  V1beta1NetworkMapSpecMapDestination,
  V1beta1NetworkMapSpecMapSource,
  V1beta1StorageMapSpecMap,
  V1beta1StorageMapSpecMapDestination,
  V1beta1StorageMapSpecMapSource,
} from '@kubev2v/types';

import { DefaultNetworkLabel } from './constants';

export const createReplacedNetworkMap = (
  source: InventoryNetwork,
  target?: OpenShiftNetworkAttachmentDefinition | string,
): V1beta1NetworkMapSpecMap => {
  const sourceEntry: V1beta1NetworkMapSpecMapSource =
    source.id === POD
      ? { type: POD }
      : { id: source.id, name: source.name, type: source.providerType };

  const targetEntry: V1beta1NetworkMapSpecMapDestination =
    typeof target === 'object'
      ? { name: target.name, namespace: target.namespace, type: MULTUS }
      : { type: target === DefaultNetworkLabel.Source ? POD : IGNORED };

  return { destination: { ...targetEntry }, source: sourceEntry };
};

export const createReplacedStorageMap = (
  source: InventoryStorage,
  target: OpenShiftStorageClass,
): V1beta1StorageMapSpecMap => {
  return {
    destination: { storageClass: target.name },
    source: { id: source.id, name: source.name, type: source.providerType },
  };
};

export const createOnAddNetworkMapping = (
  updatedMaps: V1beta1NetworkMapSpecMap[],
  sources: InventoryNetwork[],
): { newState: V1beta1NetworkMapSpecMap[]; canAddMore: boolean } => {
  const unused = sources.find(
    (src) => !updatedMaps.some((updatedMap) => updatedMap.source.id === src.id),
  );
  const newState = [...updatedMaps];

  if (unused) {
    newState.push(createReplacedNetworkMap(unused));
  }

  return { canAddMore: Boolean(unused), newState };
};

export const createOnAddStorageMapping = (
  updatedMaps: V1beta1StorageMapSpecMap[],
  sources: InventoryStorage[],
  target: OpenShiftStorageClass,
): { newState: V1beta1StorageMapSpecMap[]; canAddMore: boolean } => {
  const unused = sources.find(
    (src) => !updatedMaps.some((updatedMap) => updatedMap.source.id === src.id),
  );
  const newState = [...updatedMaps];

  if (unused) {
    newState.push(createReplacedStorageMap(unused, target));
  }

  return { canAddMore: Boolean(unused), newState };
};

export const createOnDeleteMapping = <
  T extends {
    source: V1beta1NetworkMapSpecMapSource | V1beta1StorageMapSpecMapSource;
    destination: V1beta1NetworkMapSpecMapDestination | V1beta1StorageMapSpecMapDestination;
  },
>(
  updated: T[],
  matchFn: (item: T) => boolean,
): T[] => {
  return updated.filter((item) => !matchFn(item));
};

export const createOnReplaceMapping = <T>(
  updated: T[],
  matchFn: (item: T) => boolean,
  newItem: T,
): T[] => {
  const index = updated.findIndex(matchFn);
  const newState = [...updated];

  if (index >= 0) {
    newState.splice(index, 1, newItem);
  }

  return newState;
};

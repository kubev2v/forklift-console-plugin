import {
  IAnnotatedStorageClass,
  INetworkMappingItem,
  IOpenShiftNetwork,
  IStorageMappingItem,
  MappingItem,
  MappingTarget,
  MappingType,
  POD_NETWORK,
} from 'legacy/src/queries/types';
import { doesTargetExist } from '../helpers';

export const getMappingItemTargetName = (
  item: MappingItem,
  mappingType: MappingType,
  availableTargets: MappingTarget[]
): string => {
  if (!doesTargetExist(mappingType, availableTargets, item)) return '';
  if (mappingType === MappingType.Network) {
    const networkItem = item as INetworkMappingItem;
    if (networkItem.destination.type === 'pod') return POD_NETWORK.name;
    return `${networkItem.destination.namespace} / ${networkItem.destination.name}`;
  }
  return (item as IStorageMappingItem).destination.storageClass;
};

export const groupMappingItemsByTarget = (
  mappingItems: MappingItem[],
  mappingType: MappingType,
  availableTargets: MappingTarget[]
): MappingItem[][] => {
  const targetNames: string[] = Array.from(
    new Set(
      mappingItems.map((item) => getMappingItemTargetName(item, mappingType, availableTargets))
    )
  );
  return targetNames.map((targetName) =>
    mappingItems.filter(
      (item) => getMappingItemTargetName(item, mappingType, availableTargets) === targetName
    )
  );
};

export const getMappingTargetName = (target: MappingTarget, mappingType: MappingType): string => {
  if (mappingType === MappingType.Network) {
    const network = target as IOpenShiftNetwork | typeof POD_NETWORK;
    if ((network as typeof POD_NETWORK).type === 'pod') return POD_NETWORK.name;
    return `${network.namespace} / ${network.name}`;
  }
  return (target as IAnnotatedStorageClass).name;
};

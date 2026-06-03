import { NetworkMapFieldId, type NetworkMapping } from '@utils/mappings/networkMap';
import type { MappingValue } from '@utils/types';

export const isNetworkMappingDisabled = (
  networkMappings: NetworkMapping[],
  usedNetwork: MappingValue,
) => {
  return networkMappings?.some(
    (mapping: NetworkMapping) => mapping[NetworkMapFieldId.SourceNetwork].id === usedNetwork.id,
  );
};

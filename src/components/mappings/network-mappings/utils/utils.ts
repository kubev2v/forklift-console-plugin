import {
  NetworkMapFieldId,
  type NetworkMapping,
} from 'src/plans/create/steps/network-map/constants';
import type { MappingValue } from 'src/plans/create/types';

export const isNetworkMappingDisabled = (
  networkMappings: NetworkMapping[],
  usedNetwork: MappingValue,
) => {
  return networkMappings?.some(
    (mapping: NetworkMapping) => mapping[NetworkMapFieldId.SourceNetwork].id === usedNetwork.id,
  );
};

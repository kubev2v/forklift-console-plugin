import { useMappingActions } from 'src/components/mappings/mappingActions';

import { withActionContext } from '@kubev2v/common/components/ActionServiceDropdown';
import { MappingType } from '@kubev2v/legacy/queries/types';

import { FlatNetworkMapping } from './dataForNetwork';

export const useNetworkMappingActions = ({ resourceData }: { resourceData: FlatNetworkMapping }) =>
  useMappingActions<FlatNetworkMapping>({ resourceData, mappingType: MappingType.Network });

export const NetworkMappingActions = withActionContext<FlatNetworkMapping>(
  'kebab',
  'forklift-flat-network-mapping',
);
NetworkMappingActions.displayName = 'NetworkMappingActions';

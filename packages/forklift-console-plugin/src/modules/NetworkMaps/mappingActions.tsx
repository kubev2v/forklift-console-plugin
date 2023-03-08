import { MappingType } from 'legacy/src/queries/types';
import { useMappingActions } from 'src/components/mappings/mappingActions';

import { withActionContext } from '@kubev2v/common/components/ActionServiceDropdown';

import { FlatNetworkMapping } from './dataForNetwork';

export const useNetworkMappingActions = ({ entity }: { entity: FlatNetworkMapping }) =>
  useMappingActions<FlatNetworkMapping>({ entity, mappingType: MappingType.Network });

export const NetworkMappingActions = withActionContext<FlatNetworkMapping>(
  'kebab',
  'forklift-flat-network-mapping',
);
NetworkMappingActions.displayName = 'NetworkMappingActions';

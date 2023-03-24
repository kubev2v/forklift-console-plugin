import { MappingType } from 'legacy/src/queries/types';
import { useMappingActions } from 'src/components/mappings/mappingActions';

import { withActionServiceContext } from '@kubev2v/common/components/ActionServiceDropdown';

import { FlatNetworkMapping } from './dataForNetwork';

export const useNetworkMappingActions = ({ resourceData }: { resourceData: FlatNetworkMapping }) =>
  useMappingActions<FlatNetworkMapping>({ resourceData, mappingType: MappingType.Network });

/**
 * Use the `console.action/provider` extension named `forklift-flat-network-mapping` to render
 * a set of actions in a kebab menu.
 */
export const NetworkMappingActions = withActionServiceContext<FlatNetworkMapping>({
  contextId: 'forklift-flat-network-mapping',
  variant: 'kebab',
});
NetworkMappingActions.displayName = 'NetworkMappingActions';

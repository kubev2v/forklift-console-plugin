import { useMappingActions } from 'src/components/mappings/mappingActions';

import { withActionServiceContext } from '@kubev2v/common';
import { MappingType } from '@kubev2v/legacy/queries/types';

import { FlatStorageMapping } from './dataForStorage';

export const useStorageMappingActions = ({ resourceData }: { resourceData: FlatStorageMapping }) =>
  useMappingActions<FlatStorageMapping>({ resourceData, mappingType: MappingType.Storage });

/**
 * Use the `console.action/provider` extension named `forklift-flat-storage-mapping` to render
 * a set of actions in a kebab menu.
 */
export const StorageMappingActions = withActionServiceContext<FlatStorageMapping>({
  contextId: 'forklift-flat-storage-mapping',
  variant: 'kebab',
});
StorageMappingActions.displayName = 'StorageMappingActions';

import { useMappingActions } from 'src/components/mappings/mappingActions';

import { withActionContext } from '@kubev2v/common/components/ActionServiceDropdown';
import { MappingType } from '@kubev2v/legacy/queries/types';

import { FlatStorageMapping } from './dataForStorage';

export const useStorageMappingActions = ({ resourceData }: { resourceData: FlatStorageMapping }) =>
  useMappingActions<FlatStorageMapping>({ resourceData, mappingType: MappingType.Storage });

export const StorageMappingActions = withActionContext<FlatStorageMapping>(
  'kebab',
  'forklift-flat-storage-mapping',
);
StorageMappingActions.displayName = 'StorageMappingActions';

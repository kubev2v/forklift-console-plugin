import { StorageMapData } from 'src/modules/StorageMaps/utils/types/StorageMapData';

import { ResourceField } from '@components/common/utils/types';

export type CellProps = {
  data: StorageMapData;
  fieldId: string;
  fields: ResourceField[];
};

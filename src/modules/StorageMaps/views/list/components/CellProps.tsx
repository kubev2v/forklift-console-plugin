import type { StorageMapData } from 'src/modules/StorageMaps/utils/types/StorageMapData';

import type { ResourceField } from '@components/common/utils/types';

export type CellProps = {
  data: StorageMapData;
  fieldId: string;
  fields: ResourceField[];
};

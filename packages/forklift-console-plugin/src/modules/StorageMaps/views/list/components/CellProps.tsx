import { StorageMapData } from 'src/modules/StorageMaps/utils';

import { ResourceField } from '@forklift/common/utils/types';

export type CellProps = {
  data: StorageMapData;
  fieldId: string;
  fields: ResourceField[];
};

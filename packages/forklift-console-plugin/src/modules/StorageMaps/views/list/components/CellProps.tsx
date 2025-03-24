import { StorageMapData } from 'src/modules/StorageMaps/utils';

import { ResourceField } from '@components/common/utils/types';

export type CellProps = {
  data: StorageMapData;
  fieldId: string;
  fields: ResourceField[];
};

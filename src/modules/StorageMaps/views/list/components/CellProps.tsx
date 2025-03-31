import type { StorageMapData } from 'src/modules/StorageMaps/utils';

import type { ResourceField } from '@components/common/utils/types';

export type CellProps = {
  data: StorageMapData;
  fieldId: string;
  fields: ResourceField[];
};

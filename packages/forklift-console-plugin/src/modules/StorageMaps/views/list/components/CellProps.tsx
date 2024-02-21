import { StorageMapData } from 'src/modules/StorageMaps/utils';

import { ResourceField } from '@kubev2v/common';

export type CellProps = {
  data: StorageMapData;
  fieldId: string;
  fields: ResourceField[];
};

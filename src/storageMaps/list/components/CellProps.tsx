import type { StorageMapData } from 'src/storageMaps/utils/types';

import type { ResourceField } from '@components/common/utils/types';

export type CellProps = {
  data: StorageMapData;
  fieldId: string;
  fields: ResourceField[];
};

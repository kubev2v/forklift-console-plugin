import type { ResourceField } from '@components/common/utils/types';
import type { StorageMapData } from '@utils/storage/types';

export type CellProps = {
  data: StorageMapData;
  fieldId: string;
  fields: ResourceField[];
};

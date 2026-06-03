import type { ResourceField } from '@components/common/utils/types';
import type { NetworkMapData } from '@utils/crds/maps/types';

export type CellProps = {
  data: NetworkMapData;
  fieldId: string;
  fields: ResourceField[];
};

import type { NetworkMapData } from 'src/modules/NetworkMaps/utils';

import type { ResourceField } from '@components/common/utils/types';

export type CellProps = {
  data: NetworkMapData;
  fieldId: string;
  fields: ResourceField[];
};

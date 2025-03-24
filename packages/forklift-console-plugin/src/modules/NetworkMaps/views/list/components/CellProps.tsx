import { NetworkMapData } from 'src/modules/NetworkMaps/utils';

import { ResourceField } from '@forklift/common/utils/types';

export type CellProps = {
  data: NetworkMapData;
  fieldId: string;
  fields: ResourceField[];
};

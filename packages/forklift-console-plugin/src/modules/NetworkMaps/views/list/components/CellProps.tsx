import { NetworkMapData } from 'src/modules/NetworkMaps/utils';

import { ResourceField } from '@kubev2v/common';

export type CellProps = {
  data: NetworkMapData;
  fieldId: string;
  fields: ResourceField[];
};

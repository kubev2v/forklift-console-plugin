import type { NetworkMapData } from 'src/networkMaps/utils/types';

import type { ResourceField } from '@components/common/utils/types';

export type CellProps = {
  data: NetworkMapData;
  fieldId: string;
  fields: ResourceField[];
};

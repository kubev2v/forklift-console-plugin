import { ResourceField } from '@forklift/common/utils/types';

import { InventoryHostPair } from '../utils';

export interface HostCellProps {
  data: InventoryHostPair;
  fieldId: string;
  fields: ResourceField[];
}

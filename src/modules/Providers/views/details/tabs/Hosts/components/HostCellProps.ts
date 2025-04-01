import { ResourceField } from '@components/common/utils/types';

import { InventoryHostPair } from '../utils/helpers/matchHostsToInventory';

export interface HostCellProps {
  data: InventoryHostPair;
  fieldId: string;
  fields: ResourceField[];
}

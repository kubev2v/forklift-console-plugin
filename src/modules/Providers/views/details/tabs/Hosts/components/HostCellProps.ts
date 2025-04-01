import type { ResourceField } from '@components/common/utils/types';

import type { InventoryHostPair } from '../utils/helpers/matchHostsToInventory';

export type HostCellProps = {
  data: InventoryHostPair;
  fieldId: string;
  fields: ResourceField[];
};

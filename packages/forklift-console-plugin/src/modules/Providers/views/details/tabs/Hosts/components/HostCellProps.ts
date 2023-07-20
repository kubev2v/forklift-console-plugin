import { ResourceField } from '@kubev2v/common';

import { InventoryHostPair } from '../utils';

export interface HostCellProps {
  data: InventoryHostPair;
  fieldId: string;
  fields: ResourceField[];
}

import type { ResourceField } from '@components/common/utils/types';
import type { NetworkAdapters, V1beta1Host, VSphereHostInventory } from '@kubev2v/types';

export type InventoryHostNetworkTriple = {
  inventory: VSphereHostInventory;
  host?: V1beta1Host;
  networkAdapter?: NetworkAdapters;
};

export type HostCellProps = {
  data: InventoryHostNetworkTriple;
  fieldId: string;
  fields: ResourceField[];
};

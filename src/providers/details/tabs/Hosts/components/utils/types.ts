import type { ResourceField } from '@components/common/utils/types';
import type { NetworkAdapters, V1beta1Host, VSphereHostInventory } from '@forklift-ui/types';

export type InventoryHostNetworkTriple = {
  host?: V1beta1Host;
  inventory: VSphereHostInventory;
  networkAdapter?: NetworkAdapters;
};

export type HostCellProps = {
  data: InventoryHostNetworkTriple;
  fieldId: string;
  fields: ResourceField[];
};

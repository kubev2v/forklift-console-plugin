import type { ResourceField } from '@components/common/utils/types';
import type { NetworkAdapters, V1beta1Host, VSphereHost } from '@kubev2v/types';

export type InventoryHostNetworkTriple = {
  inventory: VSphereHost;
  host?: V1beta1Host;
  networkAdapter?: NetworkAdapters;
};

export type HostCellProps = {
  data: InventoryHostNetworkTriple;
  fieldId: string;
  fields: ResourceField[];
};

export enum ValidationState {
  Success = 'success',
  Warning = 'warning',
  Error = 'error',
  Default = 'default',
}

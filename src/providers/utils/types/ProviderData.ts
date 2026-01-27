import type { ProviderInventory, V1beta1Provider } from '@forklift-ui/types';

import type { VmData } from '../../details/tabs/VirtualMachines/components/VMCellProps';

import type { ProvidersPermissionStatus } from './ProvidersPermissionStatus';

export type ProviderData = {
  provider?: V1beta1Provider;
  inventory?: ProviderInventory | undefined;
  inventoryLoading?: boolean;
  vmData?: VmData[];
  vmDataLoading?: boolean;
  permissions?: ProvidersPermissionStatus;
};

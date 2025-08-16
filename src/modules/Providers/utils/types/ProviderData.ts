import type { ProviderInventory, V1beta1Provider } from '@kubev2v/types';

import type { VmData } from '../../views/details/tabs/VirtualMachines/components/VMCellProps';

import type { ProvidersPermissionStatus } from './ProvidersPermissionStatus';

export type ProviderData = {
  provider?: V1beta1Provider;
  inventory?: ProviderInventory | undefined;
  inventoryLoading?: boolean;
  vmData?: VmData[];
  vmDataLoading?: boolean;
  permissions?: ProvidersPermissionStatus;
};

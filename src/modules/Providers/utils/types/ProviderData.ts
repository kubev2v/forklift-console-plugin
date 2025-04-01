import { ProviderInventory, V1beta1Provider } from '@kubev2v/types';

import { VmData } from '../../views/details/tabs/VirtualMachines/components/VMCellProps';
import { ProvidersPermissionStatus } from './ProvidersPermissionStatus';

export interface ProviderData {
  provider?: V1beta1Provider;
  inventory?: ProviderInventory;
  inventoryLoading?: boolean;
  vmData?: VmData[];
  vmDataLoading?: boolean;
  permissions?: ProvidersPermissionStatus;
}

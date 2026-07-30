import type { ProviderInventory, V1beta1Provider } from '@forklift-ui/types';
import type { PermissionStatus, ProviderVmData } from '@utils/types';

export type ProviderData = {
  inventory?: ProviderInventory;
  inventoryLoading?: boolean;
  permissions?: PermissionStatus;
  provider?: V1beta1Provider;
  vmData?: ProviderVmData[];
  vmDataLoading?: boolean;
};

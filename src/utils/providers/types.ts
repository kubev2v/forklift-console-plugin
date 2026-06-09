import type { ProviderInventory, V1beta1Provider } from '@forklift-ui/types';
import type { PermissionStatus, ProviderVmData } from '@utils/types';

export type ProviderData = {
  provider?: V1beta1Provider;
  inventory?: ProviderInventory | undefined;
  inventoryLoading?: boolean;
  vmData?: ProviderVmData[];
  vmDataLoading?: boolean;
  permissions?: PermissionStatus;
};

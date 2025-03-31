import type { ProviderInventory, V1beta1Provider } from '@kubev2v/types';

import type { VmData } from '../../views';

import type { ProvidersPermissionStatus } from './ProvidersPermissionStatus';

export type ProviderData = {
  provider?: V1beta1Provider;
  inventory?: ProviderInventory;
  inventoryLoading?: boolean;
  vmData?: VmData[];
  vmDataLoading?: boolean;
  permissions?: ProvidersPermissionStatus;
};

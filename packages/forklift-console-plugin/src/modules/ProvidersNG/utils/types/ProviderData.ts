import { ProviderInventory, V1beta1Provider } from '@kubev2v/types';

import { ProvidersPermissionStatus } from './ProvidersPermissionStatus';

export interface ProviderData {
  provider?: V1beta1Provider;
  inventory?: ProviderInventory;
  permissions?: ProvidersPermissionStatus;
}

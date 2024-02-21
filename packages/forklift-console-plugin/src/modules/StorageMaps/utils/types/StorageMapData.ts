import { ProvidersPermissionStatus } from 'src/modules/Providers/utils';

import { V1beta1StorageMap } from '@kubev2v/types';

export interface StorageMapData {
  obj?: V1beta1StorageMap;
  permissions?: ProvidersPermissionStatus;
}

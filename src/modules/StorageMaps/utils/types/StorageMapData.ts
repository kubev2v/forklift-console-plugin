import type { ProvidersPermissionStatus } from 'src/modules/Providers/utils';

import type { V1beta1StorageMap } from '@kubev2v/types';

export type StorageMapData = {
  obj?: V1beta1StorageMap;
  permissions?: ProvidersPermissionStatus;
};

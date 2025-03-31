import type { ProvidersPermissionStatus } from 'src/modules/Providers/utils';

import type { V1beta1NetworkMap } from '@kubev2v/types';

export type NetworkMapData = {
  obj?: V1beta1NetworkMap;
  permissions?: ProvidersPermissionStatus;
};

import { ProvidersPermissionStatus } from 'src/modules/Providers/utils';

import { V1beta1NetworkMap } from '@kubev2v/types';

export interface NetworkMapData {
  obj?: V1beta1NetworkMap;
  permissions?: ProvidersPermissionStatus;
}

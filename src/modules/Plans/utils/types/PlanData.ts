import type { ProvidersPermissionStatus } from 'src/modules/Providers/utils';

import type { V1beta1Plan } from '@kubev2v/types';

export type PlanData = {
  obj?: V1beta1Plan;
  permissions?: ProvidersPermissionStatus;
};

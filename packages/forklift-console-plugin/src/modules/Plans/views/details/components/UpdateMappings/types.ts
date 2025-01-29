import { ReactNode } from 'react';
import { PlanEditAction } from 'src/modules/Plans/utils/types/PlanEditAction';

import {
  V1beta1NetworkMap,
  V1beta1NetworkMapSpecMap,
  V1beta1StorageMap,
  V1beta1StorageMapSpecMap,
} from '@kubev2v/types';

export interface PlanMappingsSectionState {
  edit: boolean;
  dataChanged: boolean;
  alertMessage: ReactNode;
  updatedNetwork: V1beta1NetworkMapSpecMap[];
  updatedStorage: V1beta1StorageMapSpecMap[];
  planNetworkMaps: V1beta1NetworkMap;
  planStorageMaps: V1beta1StorageMap;
  editAction?: PlanEditAction;
}

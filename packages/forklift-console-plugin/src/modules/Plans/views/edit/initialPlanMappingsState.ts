import { V1beta1NetworkMap, V1beta1StorageMap } from '@kubev2v/types';

import { PlanEditAction } from '../../utils/types/PlanEditAction';
import { PlanMappingsSectionState } from '../details';

export type InitialPlanMappingsStateProps = {
  planNetworkMaps: V1beta1NetworkMap;
  planStorageMaps: V1beta1StorageMap;
  editAction?: PlanEditAction;
};

export const initialPlanMappingsState = ({
  planNetworkMaps,
  planStorageMaps,
  editAction,
}: InitialPlanMappingsStateProps): PlanMappingsSectionState => ({
  edit: true,
  dataChanged: false,
  alertMessage: null,
  updatedNetwork: planNetworkMaps?.spec?.map || [],
  updatedStorage: planStorageMaps?.spec?.map || [],
  planNetworkMaps: planNetworkMaps,
  planStorageMaps: planStorageMaps,
  editAction,
});

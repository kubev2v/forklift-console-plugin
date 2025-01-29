import { PlanEditAction } from 'src/modules/Plans/utils/types/PlanEditAction';

import { V1beta1NetworkMap, V1beta1StorageMap } from '@kubev2v/types';

import { PlanMappingsSectionState } from './types';

export type InitialPlanMappingsStateProps = {
  planNetworkMaps: V1beta1NetworkMap;
  planStorageMaps: V1beta1StorageMap;
  edit: boolean;
  editAction?: PlanEditAction;
};

export const initialPlanMappingsState = ({
  planNetworkMaps,
  planStorageMaps,
  editAction,
  edit,
}: InitialPlanMappingsStateProps): PlanMappingsSectionState => ({
  edit,
  dataChanged: false,
  alertMessage: null,
  updatedNetwork: planNetworkMaps?.spec?.map || [],
  updatedStorage: planStorageMaps?.spec?.map || [],
  planNetworkMaps: planNetworkMaps,
  planStorageMaps: planStorageMaps,
  editAction,
});

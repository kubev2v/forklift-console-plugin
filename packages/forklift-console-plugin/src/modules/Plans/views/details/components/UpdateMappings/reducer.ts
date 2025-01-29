import { hasPlanMappingsChanged } from '../../utils';

import { PlanMappingsSectionState } from './types';

export function planMappingsSectionReducer(
  state: PlanMappingsSectionState,
  action: { type: string; payload? },
): PlanMappingsSectionState {
  switch (action.type) {
    case 'SET_PLAN_MAPS': {
      const { planNetworkMaps, planStorageMaps } = action.payload;
      return {
        ...state,
        planNetworkMaps,
        planStorageMaps,
        updatedNetwork: planNetworkMaps?.spec?.map,
        updatedStorage: planStorageMaps?.spec?.map,
      };
    }
    case 'TOGGLE_EDIT': {
      return { ...state, edit: !state.edit };
    }
    case 'SET_CANCEL': {
      const dataChanged = false;

      return {
        ...state,
        dataChanged,
        alertMessage: null,
        updatedNetwork: state.planNetworkMaps.spec.map,
        updatedStorage: state.planStorageMaps.spec.map,
      };
    }
    case 'SET_ALERT_MESSAGE': {
      return { ...state, alertMessage: action.payload };
    }
    case 'ADD_NETWORK_MAPPING':
    case 'DELETE_NETWORK_MAPPING':
    case 'REPLACE_NETWORK_MAPPING': {
      const updatedNetwork = action.payload.newState;
      const dataChanged = hasPlanMappingsChanged(
        state.planNetworkMaps.spec.map,
        state.planStorageMaps.spec.map,
        updatedNetwork,
        state?.updatedStorage,
      );

      return {
        ...state,
        dataChanged,
        alertMessage: null,
        updatedNetwork,
      };
    }
    case 'ADD_STORAGE_MAPPING':
    case 'DELETE_STORAGE_MAPPING':
    case 'REPLACE_STORAGE_MAPPING': {
      const updatedStorage = action.payload.newState;
      const dataChanged = hasPlanMappingsChanged(
        state.planNetworkMaps.spec.map,
        state.planStorageMaps.spec.map,
        state?.updatedNetwork,
        updatedStorage,
      );

      return {
        ...state,
        dataChanged,
        alertMessage: null,
        updatedStorage,
      };
    }
    default:
      return state;
  }
}

import { deepCopy } from 'src/utils';

import type { V1beta1StorageMap, V1beta1StorageMapSpecMap } from '@kubev2v/types';

export type MapsSectionState = {
  StorageMap: V1beta1StorageMap | null;
  hasChanges: boolean;
  updating: boolean;
};

export type MapsAction =
  | { type: 'SET_MAP'; payload: V1beta1StorageMapSpecMap[] }
  | { type: 'SET_UPDATING'; payload: boolean }
  | { type: 'INIT'; payload: V1beta1StorageMap };

export function mapsSectionReducer(state: MapsSectionState, action: MapsAction): MapsSectionState {
  let newState: MapsSectionState;

  switch (action.type) {
    case 'SET_MAP':
      newState = { ...state, hasChanges: true };
      newState.StorageMap.spec.map = action.payload;
      return newState;
    case 'SET_UPDATING':
      return { ...state, updating: action.payload };
    case 'INIT':
      return {
        hasChanges: false,
        StorageMap: deepCopy(action.payload),
        updating: false,
      };
    default:
      return state;
  }
}

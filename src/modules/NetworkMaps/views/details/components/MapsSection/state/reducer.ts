import { deepCopy } from 'src/utils/deepCopy';

import type { V1beta1NetworkMap, V1beta1NetworkMapSpecMap } from '@kubev2v/types';

export type MapsSectionState = {
  networkMap: V1beta1NetworkMap | null;
  hasChanges: boolean;
  updating: boolean;
};

type MapsAction =
  | { type: 'SET_MAP'; payload: V1beta1NetworkMapSpecMap[] }
  | { type: 'SET_UPDATING'; payload: boolean }
  | { type: 'INIT'; payload: V1beta1NetworkMap };

export const mapsSectionReducer = (
  state: MapsSectionState,
  action: MapsAction,
): MapsSectionState => {
  let newState: MapsSectionState;

  switch (action.type) {
    case 'SET_MAP':
      newState = { ...state, hasChanges: true };
      newState.networkMap.spec.map = action.payload;
      return newState;
    case 'SET_UPDATING':
      return { ...state, updating: action.payload };
    case 'INIT':
      return {
        hasChanges: false,
        networkMap: deepCopy(action.payload),
        updating: false,
      };
    default:
      return state;
  }
};

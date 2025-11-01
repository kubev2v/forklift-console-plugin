import { deepCopy } from 'src/utils/deepCopy';

import type { V1beta1NetworkMap, V1beta1Provider } from '@kubev2v/types';

export type ProvidersSectionState = {
  networkMap: V1beta1NetworkMap | null;
  sourceProviderMode: 'view' | 'edit';
  targetProviderMode: 'view' | 'edit';
  hasChanges: boolean;
  updating: boolean;
};

type ProvidersAction =
  | { type: 'SET_SOURCE_PROVIDER'; payload: V1beta1Provider }
  | { type: 'SET_TARGET_PROVIDER'; payload: V1beta1Provider }
  | { type: 'SET_SOURCE_PROVIDER_MODE'; payload: 'view' | 'edit' }
  | { type: 'SET_TARGET_PROVIDER_MODE'; payload: 'view' | 'edit' }
  | { type: 'SET_UPDATING'; payload: boolean }
  | { type: 'INIT'; payload: V1beta1NetworkMap };

export const providersSectionReducer = (
  state: ProvidersSectionState,
  action: ProvidersAction,
): ProvidersSectionState => {
  const newState = { ...state };

  switch (action.type) {
    case 'SET_SOURCE_PROVIDER':
      if (newState.networkMap?.spec) {
        newState.hasChanges = true;
        newState.networkMap.spec.provider.source = {
          apiVersion: action.payload?.apiVersion,
          kind: action.payload?.kind,
          name: action.payload?.metadata?.name,
          namespace: action.payload?.metadata?.namespace,
          uid: action.payload?.metadata?.uid,
        };
      }
      return newState;
    case 'SET_TARGET_PROVIDER':
      if (newState.networkMap?.spec) {
        newState.hasChanges = true;
        newState.networkMap.spec.provider.destination = {
          apiVersion: action.payload?.apiVersion,
          kind: action.payload?.kind,
          name: action.payload?.metadata?.name,
          namespace: action.payload?.metadata?.namespace,
          uid: action.payload?.metadata?.uid,
        };
      }
      return newState;
    case 'SET_SOURCE_PROVIDER_MODE':
      newState.sourceProviderMode = action.payload;
      return newState;
    case 'SET_TARGET_PROVIDER_MODE':
      newState.targetProviderMode = action.payload;
      return newState;
    case 'SET_UPDATING':
      newState.updating = action.payload;
      return newState;
    case 'INIT':
      return {
        hasChanges: false,
        networkMap: deepCopy(action.payload)!,
        sourceProviderMode: 'view',
        targetProviderMode: 'view',
        updating: false,
      };
    default:
      return state;
  }
};

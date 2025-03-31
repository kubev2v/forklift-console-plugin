import { deepCopy } from 'src/utils';

import type { V1beta1Provider, V1beta1StorageMap } from '@kubev2v/types';

export type ProvidersSectionState = {
  StorageMap: V1beta1StorageMap | null;
  sourceProviderMode: 'view' | 'edit';
  targetProviderMode: 'view' | 'edit';
  hasChanges: boolean;
  updating: boolean;
};

export type ProvidersAction =
  | { type: 'SET_SOURCE_PROVIDER'; payload: V1beta1Provider }
  | { type: 'SET_TARGET_PROVIDER'; payload: V1beta1Provider }
  | { type: 'SET_SOURCE_PROVIDER_MODE'; payload: 'view' | 'edit' }
  | { type: 'SET_TARGET_PROVIDER_MODE'; payload: 'view' | 'edit' }
  | { type: 'SET_UPDATING'; payload: boolean }
  | { type: 'INIT'; payload: V1beta1StorageMap };

export function providersSectionReducer(
  state: ProvidersSectionState,
  action: ProvidersAction,
): ProvidersSectionState {
  let newState: ProvidersSectionState;

  switch (action.type) {
    case 'SET_SOURCE_PROVIDER':
      newState = { ...state, hasChanges: true };
      newState.StorageMap.spec.provider.source = {
        apiVersion: action.payload?.apiVersion,
        kind: action.payload?.kind,
        name: action.payload?.metadata?.name,
        namespace: action.payload?.metadata?.namespace,
        uid: action.payload?.metadata?.uid,
      };
      return newState;
    case 'SET_TARGET_PROVIDER':
      newState = { ...state, hasChanges: true };
      newState.StorageMap.spec.provider.destination = {
        apiVersion: action.payload?.apiVersion,
        kind: action.payload?.kind,
        name: action.payload?.metadata?.name,
        namespace: action.payload?.metadata?.namespace,
        uid: action.payload?.metadata?.uid,
      };
      return newState;
    case 'SET_SOURCE_PROVIDER_MODE':
      return { ...state, sourceProviderMode: action.payload };
    case 'SET_TARGET_PROVIDER_MODE':
      return { ...state, targetProviderMode: action.payload };

    case 'SET_UPDATING':
      return { ...state, updating: action.payload };
    case 'INIT':
      return {
        hasChanges: false,
        sourceProviderMode: 'view',
        StorageMap: deepCopy(action.payload),
        targetProviderMode: 'view',
        updating: false,
      };
    default:
      return state;
  }
}

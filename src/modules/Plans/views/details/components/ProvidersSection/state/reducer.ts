import { deepCopy } from 'src/utils/deepCopy';

import type { V1beta1Plan, V1beta1Provider } from '@kubev2v/types';

export type ProvidersSectionState = {
  plan: V1beta1Plan | null;
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
  | { type: 'INIT'; payload: V1beta1Plan };

export const providersSectionReducer = (
  state: ProvidersSectionState,
  action: ProvidersAction,
): ProvidersSectionState => {
  let newState: ProvidersSectionState;

  switch (action.type) {
    case 'SET_SOURCE_PROVIDER':
      newState = { ...state, hasChanges: true };
      newState.plan.spec.provider.source = {
        apiVersion: action.payload?.apiVersion,
        kind: action.payload?.kind,
        name: action.payload?.metadata?.name,
        namespace: action.payload?.metadata?.namespace,
        uid: action.payload?.metadata?.uid,
      };
      return newState;
    case 'SET_TARGET_PROVIDER':
      newState = { ...state, hasChanges: true };
      newState.plan.spec.provider.destination = {
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
        plan: deepCopy(action.payload),
        sourceProviderMode: 'view',
        targetProviderMode: 'view',
        updating: false,
      };
    default:
      return state;
  }
};

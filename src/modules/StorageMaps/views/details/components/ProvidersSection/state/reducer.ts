import { deepCopy } from 'src/utils/deepCopy';

import type { V1beta1Provider, V1beta1StorageMap } from '@kubev2v/types';

export type ProvidersSectionState = {
  StorageMap?: V1beta1StorageMap;
  sourceProviderMode?: 'view' | 'edit';
  targetProviderMode?: 'view' | 'edit';
  hasChanges?: boolean;
  updating?: boolean;
};

type ProvidersAction =
  | { type: 'SET_SOURCE_PROVIDER'; payload: V1beta1Provider }
  | { type: 'SET_TARGET_PROVIDER'; payload: V1beta1Provider }
  | { type: 'SET_SOURCE_PROVIDER_MODE'; payload: 'view' | 'edit' }
  | { type: 'SET_TARGET_PROVIDER_MODE'; payload: 'view' | 'edit' }
  | { type: 'SET_UPDATING'; payload: boolean }
  | { type: 'INIT'; payload: V1beta1StorageMap };

export const providersSectionReducer = (
  state: ProvidersSectionState,
  action: ProvidersAction,
): ProvidersSectionState => {
  switch (action.type) {
    case 'SET_SOURCE_PROVIDER':
      return {
        ...state,
        hasChanges: true,
        StorageMap: {
          ...state.StorageMap,
          spec: {
            ...state.StorageMap?.spec,
            provider: {
              ...state.StorageMap?.spec?.provider,
              source: {
                apiVersion: action.payload?.apiVersion,
                kind: action.payload?.kind,
                name: action.payload?.metadata?.name,
                namespace: action.payload?.metadata?.namespace,
                uid: action.payload?.metadata?.uid,
              },
            },
          },
        },
      } as Partial<ProvidersSectionState>;
    case 'SET_TARGET_PROVIDER':
      return {
        ...state,
        hasChanges: true,
        StorageMap: {
          ...state.StorageMap,
          spec: {
            ...state.StorageMap?.spec,
            provider: {
              ...state.StorageMap?.spec?.provider,
              destination: {
                apiVersion: action.payload?.apiVersion,
                kind: action.payload?.kind,
                name: action.payload?.metadata?.name,
                namespace: action.payload?.metadata?.namespace,
                uid: action.payload?.metadata?.uid,
              },
            },
          },
        },
      } as Partial<ProvidersSectionState>;
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
};

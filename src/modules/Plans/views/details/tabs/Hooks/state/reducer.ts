import { Base64 } from 'js-base64';
import { deepCopy } from 'src/utils';

import type { V1beta1Hook } from '@kubev2v/types';

export type FormState = {
  preHookSet: boolean;
  postHookSet: boolean;
  preHook: V1beta1Hook;
  postHook: V1beta1Hook;
  hasChanges: boolean;
  isLoading: boolean;
  alertMessage: React.ReactNode;
};

export type FormAction =
  | { type: 'PRE_HOOK_SET'; payload: boolean }
  | { type: 'PRE_HOOK_IMAGE'; payload: string }
  | { type: 'PRE_HOOK_PLAYBOOK'; payload: string }
  | { type: 'POST_HOOK_SET'; payload: boolean }
  | { type: 'POST_HOOK_IMAGE'; payload: string }
  | { type: 'POST_HOOK_PLAYBOOK'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ALERT_MESSAGE'; payload: React.ReactNode }
  | { type: 'INIT'; payload: FormState };

export function formReducer(state: FormState, action: FormAction): FormState {
  let newState: FormState;

  switch (action.type) {
    case 'SET_LOADING':
      newState = { ...state, isLoading: action.payload };
      return newState;
    case 'PRE_HOOK_SET':
      newState = { ...state, hasChanges: true };
      newState.preHookSet = action.payload;
      return newState;
    case 'PRE_HOOK_IMAGE':
      newState = { ...state, hasChanges: true };
      newState.preHook.spec.image = action.payload;
      return newState;
    case 'PRE_HOOK_PLAYBOOK':
      newState = { ...state, hasChanges: true };
      newState.preHook.spec.playbook = Base64.encode(action.payload);
      return newState;
    case 'POST_HOOK_SET':
      newState = { ...state, hasChanges: true };
      newState.postHookSet = action.payload;
      return newState;
    case 'POST_HOOK_IMAGE':
      newState = { ...state, hasChanges: true };
      newState.postHook.spec.image = action.payload;
      return newState;
    case 'POST_HOOK_PLAYBOOK':
      newState = { ...state, hasChanges: true };
      newState.postHook.spec.playbook = Base64.encode(action.payload);
      return newState;
    case 'INIT':
      return deepCopy(action.payload);
    case 'SET_ALERT_MESSAGE':
      return { ...state, alertMessage: action.payload };
    default:
      return state;
  }
}

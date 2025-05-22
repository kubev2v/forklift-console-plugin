import { produce } from 'immer';
import { Base64 } from 'js-base64';
import { deepCopy } from 'src/utils/deepCopy';

import { type FormAction, formActionKeys, type FormState } from './types';

export const formReducer = (state: FormState, action: FormAction): FormState => {
  switch (action.type) {
    case formActionKeys.SET_LOADING:
      return { ...state, isLoading: action.payload };
    case formActionKeys.PRE_HOOK_SET:
      return { ...state, hasChanges: true, preHookSet: action.payload };
    case formActionKeys.PRE_HOOK_IMAGE: {
      return produce(state, (draft) => {
        draft.hasChanges = true;

        if (draft.preHook?.spec) {
          draft.preHook.spec.image = action.payload;
        }
      });
    }
    case formActionKeys.PRE_HOOK_PLAYBOOK:
      return produce(state, (draft) => {
        draft.hasChanges = true;

        if (draft.preHook?.spec) {
          draft.preHook.spec.playbook = Base64.encode(action.payload);
        }
      });
    case formActionKeys.POST_HOOK_SET:
      return { ...state, hasChanges: true, postHookSet: action.payload };
    case formActionKeys.POST_HOOK_IMAGE:
      return produce(state, (draft) => {
        draft.hasChanges = true;

        if (draft.postHook?.spec) {
          draft.postHook.spec.image = action.payload;
        }
      });
    case formActionKeys.POST_HOOK_PLAYBOOK:
      return produce(state, (draft) => {
        draft.hasChanges = true;

        if (draft.postHook?.spec) {
          draft.postHook.spec.playbook = Base64.encode(action.payload);
        }
      });
    case formActionKeys.INIT:
      return deepCopy(action.payload);
    case formActionKeys.SET_ALERT_MESSAGE:
      return { ...state, alertMessage: action.payload };
    default:
      return state;
  }
};

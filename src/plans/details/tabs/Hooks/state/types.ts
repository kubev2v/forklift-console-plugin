import type { ReactNode } from 'react';

import type { V1beta1Hook } from '@kubev2v/types';

export type FormState = {
  preHookSet: boolean;
  postHookSet: boolean;
  preHook: V1beta1Hook | undefined;
  postHook: V1beta1Hook | undefined;
  hasChanges: boolean;
  isLoading: boolean;
  alertMessage: ReactNode;
};

export enum formActionKeys {
  POST_HOOK_IMAGE = 'POST_HOOK_IMAGE',
  POST_HOOK_PLAYBOOK = 'POST_HOOK_PLAYBOOK',
  POST_HOOK_SET = 'POST_HOOK_SET',
  PRE_HOOK_IMAGE = 'PRE_HOOK_IMAGE',
  PRE_HOOK_PLAYBOOK = 'PRE_HOOK_PLAYBOOK',
  PRE_HOOK_SET = 'PRE_HOOK_SET',
  SET_ALERT_MESSAGE = 'SET_ALERT_MESSAGE',
  SET_LOADING = 'SET_LOADING',
  INIT = 'INIT',
}

export type FormAction =
  | { type: formActionKeys.PRE_HOOK_SET; payload: boolean }
  | { type: formActionKeys.PRE_HOOK_IMAGE; payload: string }
  | { type: formActionKeys.PRE_HOOK_PLAYBOOK; payload: string }
  | { type: formActionKeys.POST_HOOK_SET; payload: boolean }
  | { type: formActionKeys.POST_HOOK_IMAGE; payload: string }
  | { type: formActionKeys.POST_HOOK_PLAYBOOK; payload: string }
  | { type: formActionKeys.SET_LOADING; payload: boolean }
  | { type: formActionKeys.SET_ALERT_MESSAGE; payload: ReactNode }
  | { type: formActionKeys.INIT; payload: FormState };

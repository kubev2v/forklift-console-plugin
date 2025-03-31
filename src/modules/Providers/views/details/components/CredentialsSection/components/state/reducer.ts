import type { ReactNode } from 'react';
import { isSecretDataChanged, type ValidationMsg } from 'src/modules/Providers/utils';

import type { IoK8sApiCoreV1Secret } from '@kubev2v/types';

/**
 * Represents the state of the secret edit form.
 *
 * @typedef {Object} BaseCredentialsSectionState
 * @property {boolean} reveal - Determines whether the secret's values are visible.
 * @property {boolean} edit - Determines whether the secret is currently being edited.
 * @property {IoK8sApiCoreV1Secret} newSecret - The new version of the secret being edited.
 * @property {boolean} dataChanged - Determines whether the secret's data has changed.
 * @property {boolean} dataIsValid - Determines whether the new secret's data is valid.
 * @property {ReactNode} alertMessage - The message to display when a validation error occurs.
 */
export type BaseCredentialsSectionState = {
  reveal: boolean;
  edit: boolean;
  newSecret: IoK8sApiCoreV1Secret;
  dataChanged: boolean;
  dataError: ValidationMsg;
  alertMessage: ReactNode;
};

export type BaseCredentialsAction =
  | { type: 'TOGGLE_REVEAL' }
  | { type: 'TOGGLE_EDIT' }
  | { type: 'RESET_DATA_CHANGED' }
  | { type: 'SET_NEW_SECRET'; payload: IoK8sApiCoreV1Secret }
  | { type: 'SET_ALERT_MESSAGE'; payload: ReactNode };

export function baseCredentialsSectionReducerFactory(secret, validator) {
  return function baseCredentialsSectionReducer(
    state: BaseCredentialsSectionState,
    action: BaseCredentialsAction,
  ): BaseCredentialsSectionState {
    switch (action.type) {
      case 'TOGGLE_REVEAL':
        return { ...state, reveal: !state.reveal };
      case 'TOGGLE_EDIT':
        return { ...state, edit: !state.edit };
      case 'RESET_DATA_CHANGED': {
        return { ...state, dataChanged: false };
      }
      case 'SET_NEW_SECRET': {
        const dataChanged = isSecretDataChanged(secret, action.payload);
        const validationError = validator(action.payload);

        return {
          ...state,
          alertMessage: null,
          dataChanged,
          dataError: validationError,
          newSecret: action.payload,
        };
      }
      case 'SET_ALERT_MESSAGE':
        return { ...state, alertMessage: action.payload };
      default:
        return state;
    }
  };
}

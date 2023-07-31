import React, { ReactNode, useReducer, useState } from 'react';
import { AlertMessageForModals } from 'src/modules/Providers/modals';
import { isSecretDataChanged } from 'src/modules/Providers/utils';
import { useForkliftTranslation } from 'src/utils/i18n';

import { V1Secret } from '@kubev2v/types';
import { useAccessReview } from '@openshift-console/dynamic-plugin-sdk';
import {
  Button,
  Divider,
  Flex,
  FlexItem,
  HelperText,
  HelperTextItem,
} from '@patternfly/react-core';
import EyeIcon from '@patternfly/react-icons/dist/esm/icons/eye-icon';
import EyeSlashIcon from '@patternfly/react-icons/dist/esm/icons/eye-slash-icon';
import Pencil from '@patternfly/react-icons/dist/esm/icons/pencil-alt-icon';

import { patchSecretData } from './edit';

import './BaseCredentialsSection.style.css';

export interface ListComponentProps {
  secret: V1Secret;
  reveal: boolean;
}

export interface EditComponentProps {
  secret: V1Secret;
  onChange: (newValue: V1Secret) => void;
}

/**
 * Represents the state of the secret edit form.
 *
 * @typedef {Object} BaseCredentialsSecretState
 * @property {boolean} reveal - Determines whether the secret's values are visible.
 * @property {boolean} edit - Determines whether the secret is currently being edited.
 * @property {V1Secret} newSecret - The new version of the secret being edited.
 * @property {boolean} dataChanged - Determines whether the secret's data has changed.
 * @property {boolean} dataIsValid - Determines whether the new secret's data is valid.
 * @property {ReactNode} alertMessage - The message to display when a validation error occurs.
 */
export interface BaseCredentialsSecretState {
  reveal: boolean;
  edit: boolean;
  newSecret: V1Secret;
  dataChanged: boolean;
  dataError: Error | null;
  alertMessage: ReactNode;
}

export type BaseCredentialsSectionProps = {
  secret: V1Secret;
  validator: (secret: V1Secret) => Error | null;
  ListComponent: React.FC<ListComponentProps>;
  EditComponent: React.FC<EditComponentProps>;
};

export const BaseCredentialsSection: React.FC<BaseCredentialsSectionProps> = ({
  secret,
  validator,
  ListComponent,
  EditComponent,
}) => {
  const { t } = useForkliftTranslation();
  const [isLoading, setIsLoading] = useState(false);

  const [canPatch] = useAccessReview({
    group: '',
    resource: 'secrets',
    verb: 'patch',
    namespace: secret.metadata.namespace,
    name: secret.metadata.name,
  });

  const initialState: BaseCredentialsSecretState = {
    reveal: false,
    edit: false,
    newSecret: secret,
    dataChanged: false,
    dataError: null,
    alertMessage: null,
  };

  function reducer(
    state: BaseCredentialsSecretState,
    action: { type: string; payload?: V1Secret },
  ): BaseCredentialsSecretState {
    switch (action.type) {
      case 'TOGGLE_REVEAL':
        return { ...state, reveal: !state.reveal };
      case 'TOGGLE_EDIT':
        return { ...state, edit: !state.edit };
      case 'SET_NEW_SECRET': {
        const dataChanged = isSecretDataChanged(secret, action.payload);
        const validationError = validator(action.payload);

        return {
          ...state,
          dataChanged,
          dataError: validationError,
          newSecret: action.payload,
          alertMessage: null,
        };
      }
      case 'SET_ALERT_MESSAGE':
        return { ...state, alertMessage: action.payload };
      default:
        return state;
    }
  }
  const [state, dispatch] = useReducer(reducer, initialState);

  if (!secret?.data) {
    return <span className="text-muted">{t('No credentials found.')}</span>;
  }

  // toggle between view and edit mode
  function toggleEdit() {
    dispatch({ type: 'TOGGLE_EDIT' });
  }

  // toggle secrets visible and hidden in view mode
  function toggleReveal() {
    dispatch({ type: 'TOGGLE_REVEAL' });
  }

  // Handle user edits
  function onNewSecretChange(newValue: V1Secret) {
    // update staged secret with new value
    dispatch({ type: 'SET_NEW_SECRET', payload: newValue });
  }

  // Handle user clicking "cancel"
  function onCancel() {
    // clear changes and return to view mode
    dispatch({ type: 'SET_NEW_SECRET', payload: secret });
    toggleEdit();
  }

  // Handle user clicking "save"
  async function onUpdate() {
    setIsLoading(true);

    try {
      // Patch provider secret, set clean to `true`
      // to remove old values from the secret
      await patchSecretData(state.newSecret, true);

      setIsLoading(false);
      toggleEdit();
    } catch (err) {
      dispatch({
        type: 'SET_ALERT_MESSAGE',
        payload: (
          <AlertMessageForModals title={t('Error')} message={err.message || err.toString()} />
        ),
      });

      setIsLoading(false);
    }
  }

  return state.edit ? (
    <>
      <Flex>
        <FlexItem>
          <Button
            variant="primary"
            onClick={onUpdate}
            isDisabled={!state.dataChanged || state.dataError !== null}
            isLoading={isLoading}
          >
            {t('Update credentials')}
          </Button>
        </FlexItem>

        <FlexItem>
          <Button variant="secondary" onClick={onCancel}>
            {t('Cancel')}
          </Button>
        </FlexItem>
      </Flex>

      <HelperText className="forklift-section-secret-edit">
        {state.dataError ? (
          <HelperTextItem variant="error">{state.dataError.toString()}</HelperTextItem>
        ) : (
          <HelperTextItem variant="indeterminate">
            {t(
              'Click the update credentials button to save your changes, button is disabled until a change is detected.',
            )}
          </HelperTextItem>
        )}
      </HelperText>

      <Divider className="forklift-section-secret-edit" />

      {state.alertMessage}
      <EditComponent secret={state.newSecret} onChange={onNewSecretChange} />
    </>
  ) : (
    <>
      <Flex>
        {canPatch && (
          <FlexItem>
            <Button variant="secondary" icon={<Pencil />} onClick={toggleEdit}>
              {t('Edit credentials')}
            </Button>
          </FlexItem>
        )}
        <FlexItem align={{ default: 'alignRight' }}>
          <Button
            variant="link"
            icon={state.reveal ? <EyeSlashIcon /> : <EyeIcon />}
            onClick={toggleReveal}
          >
            {state.reveal ? t('Hide values') : t('Reveal values')}
          </Button>
        </FlexItem>
      </Flex>

      <ListComponent secret={secret} reveal={state.reveal} />
    </>
  );
};

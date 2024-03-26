import React, { useReducer, useState } from 'react';
import { AlertMessageForModals } from 'src/modules/Providers/modals';
import { ValidationMsg } from 'src/modules/Providers/utils';
import { useForkliftTranslation } from 'src/utils/i18n';

import { IoK8sApiCoreV1Secret } from '@kubev2v/types';
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
import { baseCredentialsSectionReducerFactory, BaseCredentialsSectionState } from './state';

import './BaseCredentialsSection.style.css';

export interface ListComponentProps {
  secret: IoK8sApiCoreV1Secret;
  reveal: boolean;
}

export interface EditComponentProps {
  secret: IoK8sApiCoreV1Secret;
  onChange: (newValue: IoK8sApiCoreV1Secret) => void;
}

export type BaseCredentialsSectionProps = {
  secret: IoK8sApiCoreV1Secret;
  validator: (secret: IoK8sApiCoreV1Secret) => ValidationMsg;
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

  const initialState: BaseCredentialsSectionState = {
    reveal: false,
    edit: false,
    newSecret: secret,
    dataChanged: false,
    dataError: { type: 'default' },
    alertMessage: null,
  };

  const [state, dispatch] = useReducer(
    baseCredentialsSectionReducerFactory(secret, validator),
    initialState,
  );

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

  // mark data as unchanged, i.e. current staged secret data is equal to saved secret data
  function resetDataChanged() {
    dispatch({ type: 'RESET_DATA_CHANGED' });
  }

  // Handle user edits
  function onNewSecretChange(newValue: IoK8sApiCoreV1Secret) {
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
      // Patch provider secret, set clean to `true` to remove old values from the secret
      // if successful reset data change
      await patchSecretData(state.newSecret, true);
      resetDataChanged();

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
            isDisabled={!state.dataChanged || state.dataError.type === 'error'}
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
        {state.dataError.type === 'error' ? (
          <HelperTextItem variant="error">{state.dataError.msg}</HelperTextItem>
        ) : (
          <HelperTextItem variant="indeterminate">
            {t(
              'Click the update credentials button to save your changes, button is disabled until a change is detected.',
            )}
          </HelperTextItem>
        )}
      </HelperText>

      <Divider />

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

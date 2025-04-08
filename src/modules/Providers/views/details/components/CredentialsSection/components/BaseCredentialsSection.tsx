import { type FC, useReducer, useState } from 'react';
import { AlertMessageForModals } from 'src/modules/Providers/modals/components/AlertMessageForModals';
import type { ValidationMsg } from 'src/modules/Providers/utils/validators/common';
import { useForkliftTranslation } from 'src/utils/i18n';

import type { IoK8sApiCoreV1Secret, V1beta1Provider } from '@kubev2v/types';
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

import { patchSecretData } from './edit/patchSecretData';
import {
  baseCredentialsSectionReducerFactory,
  type BaseCredentialsSectionState,
} from './state/reducer';

import './BaseCredentialsSection.style.css';

export type ListComponentProps = {
  secret: IoK8sApiCoreV1Secret;
  reveal: boolean;
};

export type EditComponentProps = {
  secret: IoK8sApiCoreV1Secret;
  onChange: (newValue: IoK8sApiCoreV1Secret) => void;
};

export type BaseCredentialsSectionProps = {
  secret: IoK8sApiCoreV1Secret;
  validator: (provider: V1beta1Provider, secret: IoK8sApiCoreV1Secret) => ValidationMsg;
  ListComponent: FC<ListComponentProps>;
  EditComponent: FC<EditComponentProps>;
};

export const BaseCredentialsSection: FC<BaseCredentialsSectionProps> = ({
  EditComponent,
  ListComponent,
  secret,
  validator,
}) => {
  const { t } = useForkliftTranslation();
  const [isLoading, setIsLoading] = useState(false);

  const [canPatch] = useAccessReview({
    group: '',
    name: secret.metadata.name,
    namespace: secret.metadata.namespace,
    resource: 'secrets',
    verb: 'patch',
  });

  const initialState: BaseCredentialsSectionState = {
    alertMessage: null,
    dataChanged: false,
    dataError: { type: 'default' },
    edit: false,
    newSecret: secret,
    reveal: false,
  };

  const [state, dispatch] = useReducer(
    baseCredentialsSectionReducerFactory(secret, validator),
    initialState,
  );

  if (!secret?.data) {
    return <span className="text-muted">{t('No credentials found.')}</span>;
  }

  // toggle between view and edit mode
  const toggleEdit = () => {
    dispatch({ type: 'TOGGLE_EDIT' });
  };

  // toggle secrets visible and hidden in view mode
  const toggleReveal = () => {
    dispatch({ type: 'TOGGLE_REVEAL' });
  };

  // mark data as unchanged, i.e. current staged secret data is equal to saved secret data
  const resetDataChanged = () => {
    dispatch({ type: 'RESET_DATA_CHANGED' });
  };

  // Handle user edits
  const onNewSecretChange = (newValue: IoK8sApiCoreV1Secret) => {
    // update staged secret with new value
    dispatch({ payload: newValue, type: 'SET_NEW_SECRET' });
  };

  // Handle user clicking "cancel"
  const onCancel = () => {
    // clear changes and return to view mode
    dispatch({ payload: secret, type: 'SET_NEW_SECRET' });
    toggleEdit();
  };

  // Handle user clicking "save"
  const onUpdate = async () => {
    setIsLoading(true);

    try {
      // Patch provider secret, set clean to `true` to remove old values from the secret
      // if successful reset data change
      await patchSecretData(state.newSecret, true);
      resetDataChanged();

      setIsLoading(false);
      toggleEdit();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : err?.toString();
      dispatch({
        payload: <AlertMessageForModals title={t('Error')} message={errorMessage} />,
        type: 'SET_ALERT_MESSAGE',
      });

      setIsLoading(false);
    }
  };

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

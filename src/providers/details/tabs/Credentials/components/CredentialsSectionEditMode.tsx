import { type FC, type ReactNode, useState } from 'react';
import { AlertMessageForModals } from 'src/modules/Providers/modals/components/AlertMessageForModals';
import type { ValidationMsg } from 'src/modules/Providers/utils/validators/common';
import { ValidationState } from 'src/providers/utils/types';
import { useForkliftTranslation } from 'src/utils/i18n';

import type { IoK8sApiCoreV1Secret, V1beta1Provider } from '@kubev2v/types';
import {
  Button,
  ButtonVariant,
  Divider,
  Flex,
  FlexItem,
  HelperText,
  HelperTextItem,
} from '@patternfly/react-core';

import { getCredentialsEditModeByType } from './utils/getCredentialsEditModeByType';
import { getCredentialsValidatorByType } from './utils/getCredentialsValidatorByType';
import { isSecretDataChanged } from './utils/isSecretDataChanged';
import { patchSecretData } from './utils/patchSecretData';

import './CredentialsSectionEditViewModes.style.scss';

type CredentialsSectionEditModeProps = {
  provider: V1beta1Provider;
  secret: IoK8sApiCoreV1Secret;
  toggleEdit: () => void;
};

const CredentialsSectionEditMode: FC<CredentialsSectionEditModeProps> = ({
  provider,
  secret,
  toggleEdit,
}) => {
  const { t } = useForkliftTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [dataChanged, setDataChanged] = useState(false);
  const [changedSecret, setChangedSecret] = useState<IoK8sApiCoreV1Secret>(secret);
  const [dataError, setDataError] = useState<ValidationMsg>({ type: ValidationState.Default });
  const [alertMessage, setAlertMessage] = useState<ReactNode>();

  const validator = getCredentialsValidatorByType(provider);
  const CredentialsEditModeByType = getCredentialsEditModeByType(provider);

  if (!secret?.data || !CredentialsEditModeByType || !validator) {
    return <span className="text-muted">{t('No credentials found.')}</span>;
  }
  const setNewSecret = (newValue: IoK8sApiCoreV1Secret) => {
    setChangedSecret(newValue);
    setDataChanged(isSecretDataChanged(secret, newValue));
    setDataError(validator(newValue, provider));
    setAlertMessage(null);
  };

  const onCancel = () => {
    setNewSecret(secret);
    toggleEdit();
  };

  const onNewSecretChange = (newValue: IoK8sApiCoreV1Secret) => {
    setNewSecret(newValue);
  };

  const onUpdate = async () => {
    setIsLoading(true);

    try {
      await patchSecretData(changedSecret, true);
      setDataChanged(false);

      setIsLoading(false);
      toggleEdit();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : err?.toString();
      setAlertMessage(errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <>
      <Flex>
        <FlexItem>
          <Button
            variant={ButtonVariant.primary}
            onClick={onUpdate}
            isDisabled={!dataChanged || dataError.type === 'error'}
            isLoading={isLoading}
          >
            {t('Update credentials')}
          </Button>
        </FlexItem>
        <FlexItem>
          <Button variant={ButtonVariant.secondary} onClick={onCancel}>
            {t('Cancel')}
          </Button>
        </FlexItem>
      </Flex>

      <HelperText className="forklift-section-secret-edit">
        {dataError.type === 'error' ? (
          <HelperTextItem variant="error">{dataError.msg}</HelperTextItem>
        ) : (
          <HelperTextItem>
            {t(
              'Click the update credentials button to save your changes, button is disabled until a change is detected.',
            )}
          </HelperTextItem>
        )}
      </HelperText>

      <Divider />

      {alertMessage && <AlertMessageForModals title={t('Error')} message={alertMessage} />}

      <CredentialsEditModeByType secret={changedSecret} onNewSecretChange={onNewSecretChange} />
    </>
  );
};

export default CredentialsSectionEditMode;

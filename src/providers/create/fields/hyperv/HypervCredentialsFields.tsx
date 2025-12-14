import type { FC } from 'react';
import { useState } from 'react';
import { useController } from 'react-hook-form';

import { FormGroupWithHelpText } from '@components/common/FormGroupWithHelpText/FormGroupWithHelpText';
import { Button, ButtonVariant, InputGroup, TextInput } from '@patternfly/react-core';
import { EyeIcon, EyeSlashIcon } from '@patternfly/react-icons';
import { getInputValidated } from '@utils/form';
import { useForkliftTranslation } from '@utils/i18n';

import { useCreateProviderFormContext } from '../../hooks/useCreateProviderFormContext';
import { ProviderFormFieldId } from '../constants';

const HypervCredentialsFields: FC = () => {
  const { t } = useForkliftTranslation();
  const [passwordHidden, setPasswordHidden] = useState(true);
  const { control } = useCreateProviderFormContext();

  const {
    field: { onChange: onUsernameChange, value: usernameValue },
    fieldState: { error: usernameError },
  } = useController({
    control,
    name: ProviderFormFieldId.SmbUsername,
    rules: {
      required: t('Username is required'),
    },
  });

  const {
    field: { onChange: onPasswordChange, value: passwordValue },
    fieldState: { error: passwordError },
  } = useController({
    control,
    name: ProviderFormFieldId.SmbPassword,
    rules: {
      required: t('Password is required'),
    },
  });

  return (
    <>
      <FormGroupWithHelpText
        label={t('Username')}
        isRequired
        fieldId={ProviderFormFieldId.SmbUsername}
        helperText={t(
          'Username for accessing the SMB share containing Hyper-V exported VMs, for example: DOMAIN\\username or username',
        )}
        helperTextInvalid={usernameError?.message}
        validated={getInputValidated(usernameError)}
      >
        <TextInput
          spellCheck="false"
          type="text"
          id={ProviderFormFieldId.SmbUsername}
          data-testid="smb-username-input"
          value={usernameValue ?? ''}
          onChange={(_event, val) => {
            onUsernameChange(val);
          }}
          validated={getInputValidated(usernameError)}
        />
      </FormGroupWithHelpText>

      <FormGroupWithHelpText
        label={t('Password')}
        isRequired
        fieldId={ProviderFormFieldId.SmbPassword}
        helperText={t('Password for accessing the SMB share')}
        helperTextInvalid={passwordError?.message}
        validated={getInputValidated(passwordError)}
      >
        <InputGroup>
          <TextInput
            spellCheck="false"
            type={passwordHidden ? 'password' : 'text'}
            id={ProviderFormFieldId.SmbPassword}
            data-testid="smb-password-input"
            value={passwordValue ?? ''}
            onChange={(_event, val) => {
              onPasswordChange(val);
            }}
            validated={getInputValidated(passwordError)}
          />
          <Button
            variant={ButtonVariant.control}
            onClick={() => {
              setPasswordHidden(!passwordHidden);
            }}
            aria-label={passwordHidden ? t('Show password') : t('Hide password')}
          >
            {passwordHidden ? <EyeIcon /> : <EyeSlashIcon />}
          </Button>
        </InputGroup>
      </FormGroupWithHelpText>
    </>
  );
};

export default HypervCredentialsFields;

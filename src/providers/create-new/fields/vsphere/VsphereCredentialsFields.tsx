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

import { validateVspherePassword, validateVsphereUsername } from './vsphereFieldValidators';

const VsphereCredentialsFields: FC = () => {
  const { t } = useForkliftTranslation();
  const { control } = useCreateProviderFormContext();
  const [passwordHidden, setPasswordHidden] = useState(true);

  const {
    field: { onChange: onUsernameChange, value: usernameValue },
    fieldState: { error: usernameError },
  } = useController({
    control,
    name: ProviderFormFieldId.VsphereUsername,
    rules: {
      required: t('Username is required'),
      validate: validateVsphereUsername,
    },
  });

  const {
    field: { onChange: onPasswordChange, value: passwordValue },
    fieldState: { error: passwordError },
  } = useController({
    control,
    name: ProviderFormFieldId.VspherePassword,
    rules: {
      required: t('Password is required'),
      validate: validateVspherePassword,
    },
  });

  const togglePasswordHidden = () => {
    setPasswordHidden((prev) => !prev);
  };

  return (
    <>
      <FormGroupWithHelpText
        label={t('Username')}
        isRequired
        fieldId={ProviderFormFieldId.VsphereUsername}
        validated={getInputValidated(usernameError)}
        helperText={t('Username for connecting to the vSphere API endpoint.')}
        helperTextInvalid={usernameError?.message}
      >
        <TextInput
          id={ProviderFormFieldId.VsphereUsername}
          type="text"
          value={usernameValue ?? ''}
          onChange={(_event, val) => {
            onUsernameChange(val);
          }}
          validated={getInputValidated(usernameError)}
          data-testid="vsphere-username-input"
          spellCheck="false"
        />
      </FormGroupWithHelpText>

      <FormGroupWithHelpText
        label={t('Password')}
        isRequired
        fieldId={ProviderFormFieldId.VspherePassword}
        validated={getInputValidated(passwordError)}
        helperText={t('Password for connecting to the vSphere API endpoint.')}
        helperTextInvalid={passwordError?.message}
      >
        <InputGroup>
          <TextInput
            id={ProviderFormFieldId.VspherePassword}
            type={passwordHidden ? 'password' : 'text'}
            value={passwordValue ?? ''}
            onChange={(_event, val) => {
              onPasswordChange(val);
            }}
            validated={getInputValidated(passwordError)}
            data-testid="vsphere-password-input"
            spellCheck="false"
            aria-label={t('Password input')}
          />
          <Button
            variant={ButtonVariant.control}
            onClick={togglePasswordHidden}
            aria-label={passwordHidden ? t('Show password') : t('Hide password')}
          >
            {passwordHidden ? <EyeIcon /> : <EyeSlashIcon />}
          </Button>
        </InputGroup>
      </FormGroupWithHelpText>
    </>
  );
};

export default VsphereCredentialsFields;

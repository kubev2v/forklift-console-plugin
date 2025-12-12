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

import { validateOvirtPassword, validateOvirtUsername } from './ovirtFieldValidators';

const OvirtCredentialsFields: FC = () => {
  const { t } = useForkliftTranslation();
  const [passwordHidden, setPasswordHidden] = useState(true);
  const { control } = useCreateProviderFormContext();

  const {
    field: { onChange: onUsernameChange, value: usernameValue },
    fieldState: { error: usernameError },
  } = useController({
    control,
    name: ProviderFormFieldId.OvirtUsername,
    rules: {
      required: t('Username is required'),
      validate: validateOvirtUsername,
    },
  });

  const {
    field: { onChange: onPasswordChange, value: passwordValue },
    fieldState: { error: passwordError },
  } = useController({
    control,
    name: ProviderFormFieldId.OvirtPassword,
    rules: {
      required: t('Password is required'),
      validate: validateOvirtPassword,
    },
  });

  return (
    <>
      <FormGroupWithHelpText
        label={t('Username')}
        isRequired
        fieldId={ProviderFormFieldId.OvirtUsername}
        helperText={t(
          'A username for connecting to the Red Hat Virtualization Manager (RHVM) API endpoint, for example: name@internal',
        )}
        helperTextInvalid={usernameError?.message}
        validated={getInputValidated(usernameError)}
      >
        <TextInput
          spellCheck="false"
          type="text"
          id={ProviderFormFieldId.OvirtUsername}
          data-testid="ovirt-username-input"
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
        fieldId={ProviderFormFieldId.OvirtPassword}
        helperText={t(
          'User password for connecting to the Red Hat Virtualization Manager (RHVM) API endpoint',
        )}
        helperTextInvalid={passwordError?.message}
        validated={getInputValidated(passwordError)}
      >
        <InputGroup>
          <TextInput
            spellCheck="false"
            type={passwordHidden ? 'password' : 'text'}
            id={ProviderFormFieldId.OvirtPassword}
            data-testid="ovirt-password-input"
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

export default OvirtCredentialsFields;

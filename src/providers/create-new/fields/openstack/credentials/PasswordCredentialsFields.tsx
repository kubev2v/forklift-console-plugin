import { type FC, useState } from 'react';
import { useController } from 'react-hook-form';
import { OpenstackSecretFieldsId } from 'src/providers/utils/constants';

import { FormGroupWithHelpText } from '@components/common/FormGroupWithHelpText/FormGroupWithHelpText';
import { Button, ButtonVariant, Form, InputGroup, TextInput } from '@patternfly/react-core';
import { EyeIcon, EyeSlashIcon } from '@patternfly/react-icons';
import { getInputValidated } from '@utils/form';
import { useForkliftTranslation } from '@utils/i18n';

import { useCreateProviderFormContext } from '../../../hooks/useCreateProviderFormContext';
import { ProviderFormFieldId } from '../../constants';

import OpenstackTextField from './OpenstackTextField';
import { validateOpenstackField } from './useOpenstackFieldValidation';

const PasswordCredentialsFields: FC = () => {
  const { t } = useForkliftTranslation();
  const { control } = useCreateProviderFormContext();
  const [passwordHidden, setPasswordHidden] = useState<boolean>(true);

  const {
    field: { onChange: onPasswordChange, value: passwordValue },
    fieldState: { error: passwordError },
  } = useController({
    control,
    name: ProviderFormFieldId.OpenstackPassword,
    rules: {
      required: t('Password is required'),
      validate: (val: string | boolean | undefined) =>
        validateOpenstackField(OpenstackSecretFieldsId.Password)(val),
    },
  });

  return (
    <Form>
      <OpenstackTextField
        fieldId={ProviderFormFieldId.OpenstackUsername}
        openstackFieldId={OpenstackSecretFieldsId.Username}
        label={t('Username')}
        helperText={t('Username for connecting to OpenStack Identity (Keystone)')}
        testId="openstack-username-input"
      />

      <FormGroupWithHelpText
        label={t('Password')}
        isRequired
        fieldId={ProviderFormFieldId.OpenstackPassword}
        validated={getInputValidated(passwordError)}
        helperTextInvalid={passwordError?.message}
      >
        <InputGroup>
          <TextInput
            type={passwordHidden ? 'password' : 'text'}
            id={ProviderFormFieldId.OpenstackPassword}
            value={passwordValue ?? ''}
            onChange={(_event, val) => {
              onPasswordChange(val);
            }}
            validated={getInputValidated(passwordError)}
            data-testid="openstack-password-input"
          />
          <Button
            variant={ButtonVariant.control}
            onClick={() => {
              setPasswordHidden(!passwordHidden);
            }}
            aria-label={passwordHidden ? 'Show password' : 'Hide password'}
          >
            {passwordHidden ? <EyeIcon /> : <EyeSlashIcon />}
          </Button>
        </InputGroup>
      </FormGroupWithHelpText>

      <OpenstackTextField
        fieldId={ProviderFormFieldId.OpenstackRegionName}
        openstackFieldId={OpenstackSecretFieldsId.RegionName}
        label={t('Region')}
        testId="openstack-region-input"
      />

      <OpenstackTextField
        fieldId={ProviderFormFieldId.OpenstackProjectName}
        openstackFieldId={OpenstackSecretFieldsId.ProjectName}
        label={t('Project')}
        testId="openstack-project-input"
      />

      <OpenstackTextField
        fieldId={ProviderFormFieldId.OpenstackDomainName}
        openstackFieldId={OpenstackSecretFieldsId.DomainName}
        label={t('Domain')}
        testId="openstack-domain-input"
      />
    </Form>
  );
};

export default PasswordCredentialsFields;

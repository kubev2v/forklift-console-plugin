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

const ApplicationCredentialNameCredentialsFields: FC = () => {
  const { t } = useForkliftTranslation();
  const { control } = useCreateProviderFormContext();
  const [secretHidden, setSecretHidden] = useState<boolean>(true);

  const {
    field: { onChange: onAppCredNameChange, value: appCredNameValue },
    fieldState: { error: appCredNameError },
  } = useController({
    control,
    name: ProviderFormFieldId.OpenstackApplicationCredentialName,
    rules: {
      required: t('Application credential name is required'),
      validate: (val: string | boolean | undefined) =>
        validateOpenstackField(OpenstackSecretFieldsId.ApplicationCredentialName)(val),
    },
  });

  const {
    field: { onChange: onSecretChange, value: secretValue },
    fieldState: { error: secretError },
  } = useController({
    control,
    name: ProviderFormFieldId.OpenstackApplicationCredentialSecret,
    rules: {
      required: t('Application credential secret is required'),
      validate: (val: string | boolean | undefined) =>
        validateOpenstackField(OpenstackSecretFieldsId.ApplicationCredentialSecret)(val),
    },
  });

  return (
    <Form>
      <FormGroupWithHelpText
        label={t('Application credential name')}
        isRequired
        fieldId={ProviderFormFieldId.OpenstackApplicationCredentialName}
        validated={getInputValidated(appCredNameError)}
        helperTextInvalid={appCredNameError?.message}
      >
        <TextInput
          type="text"
          id={ProviderFormFieldId.OpenstackApplicationCredentialName}
          value={appCredNameValue ?? ''}
          onChange={(_event, val) => {
            onAppCredNameChange(val);
          }}
          validated={getInputValidated(appCredNameError)}
          data-testid="openstack-app-cred-name-input"
        />
      </FormGroupWithHelpText>

      <FormGroupWithHelpText
        label={t('Application credential secret')}
        isRequired
        fieldId={ProviderFormFieldId.OpenstackApplicationCredentialSecret}
        validated={getInputValidated(secretError)}
        helperTextInvalid={secretError?.message}
      >
        <InputGroup>
          <TextInput
            type={secretHidden ? 'password' : 'text'}
            id={ProviderFormFieldId.OpenstackApplicationCredentialSecret}
            value={secretValue ?? ''}
            onChange={(_event, val) => {
              onSecretChange(val);
            }}
            validated={getInputValidated(secretError)}
            data-testid="openstack-app-cred-secret-input"
          />
          <Button
            variant={ButtonVariant.control}
            onClick={() => {
              setSecretHidden(!secretHidden);
            }}
            aria-label={secretHidden ? 'Show secret' : 'Hide secret'}
          >
            {secretHidden ? <EyeIcon /> : <EyeSlashIcon />}
          </Button>
        </InputGroup>
      </FormGroupWithHelpText>

      <OpenstackTextField
        fieldId={ProviderFormFieldId.OpenstackUsername}
        openstackFieldId={OpenstackSecretFieldsId.Username}
        label={t('Username')}
        helperText={t('Username for connecting to OpenStack Identity (Keystone)')}
        testId="openstack-username-input"
      />

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

export default ApplicationCredentialNameCredentialsFields;

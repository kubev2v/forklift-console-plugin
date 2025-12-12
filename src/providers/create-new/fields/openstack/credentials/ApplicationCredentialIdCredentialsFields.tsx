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

const ApplicationCredentialIdCredentialsFields: FC = () => {
  const { t } = useForkliftTranslation();
  const { control } = useCreateProviderFormContext();
  const [secretHidden, setSecretHidden] = useState<boolean>(true);

  const {
    field: { onChange: onAppCredIdChange, value: appCredIdValue },
    fieldState: { error: appCredIdError },
  } = useController({
    control,
    name: ProviderFormFieldId.OpenstackApplicationCredentialId,
    rules: {
      required: t('Application credential ID is required'),
      validate: (val: string | boolean | undefined) =>
        validateOpenstackField(OpenstackSecretFieldsId.ApplicationCredentialId)(val),
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
        label={t('Application credential ID')}
        isRequired
        fieldId={ProviderFormFieldId.OpenstackApplicationCredentialId}
        validated={getInputValidated(appCredIdError)}
        helperTextInvalid={appCredIdError?.message}
      >
        <TextInput
          type="text"
          id={ProviderFormFieldId.OpenstackApplicationCredentialId}
          value={appCredIdValue ?? ''}
          onChange={(_event, val) => {
            onAppCredIdChange(val);
          }}
          validated={getInputValidated(appCredIdError)}
          data-testid="openstack-app-cred-id-input"
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
    </Form>
  );
};

export default ApplicationCredentialIdCredentialsFields;

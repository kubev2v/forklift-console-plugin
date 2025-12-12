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

const TokenWithUsernameCredentialsFields: FC = () => {
  const { t } = useForkliftTranslation();
  const { control } = useCreateProviderFormContext();
  const [tokenHidden, setTokenHidden] = useState<boolean>(true);

  const {
    field: { onChange: onTokenChange, value: tokenValue },
    fieldState: { error: tokenError },
  } = useController({
    control,
    name: ProviderFormFieldId.OpenstackToken,
    rules: {
      required: t('Token is required'),
      validate: (val: string | boolean | undefined) =>
        validateOpenstackField(OpenstackSecretFieldsId.Token)(val),
    },
  });

  return (
    <Form>
      <FormGroupWithHelpText
        label={t('Token')}
        isRequired
        fieldId={ProviderFormFieldId.OpenstackToken}
        validated={getInputValidated(tokenError)}
        helperText={t('Authentication token for OpenStack')}
        helperTextInvalid={tokenError?.message}
      >
        <InputGroup>
          <TextInput
            type={tokenHidden ? 'password' : 'text'}
            id={ProviderFormFieldId.OpenstackToken}
            value={tokenValue ?? ''}
            onChange={(_event, val) => {
              onTokenChange(val);
            }}
            validated={getInputValidated(tokenError)}
            data-testid="openstack-token-input"
          />
          <Button
            variant={ButtonVariant.control}
            onClick={() => {
              setTokenHidden(!tokenHidden);
            }}
            aria-label={tokenHidden ? 'Show token' : 'Hide token'}
          >
            {tokenHidden ? <EyeIcon /> : <EyeSlashIcon />}
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

export default TokenWithUsernameCredentialsFields;

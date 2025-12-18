import type { FC } from 'react';
import { useController } from 'react-hook-form';
import { OpenstackAuthType, openstackAuthTypeLabels } from 'src/providers/utils/constants';

import { FormGroupWithHelpText } from '@components/common/FormGroupWithHelpText/FormGroupWithHelpText';
import { HelperText, HelperTextItem, Radio, Stack } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import { useCreateProviderFormContext } from '../../hooks/useCreateProviderFormContext';
import { ProviderFormFieldId } from '../constants';

import ApplicationCredentialIdCredentialsFields from './credentials/ApplicationCredentialIdCredentialsFields';
import ApplicationCredentialNameCredentialsFields from './credentials/ApplicationCredentialNameCredentialsFields';
import PasswordCredentialsFields from './credentials/PasswordCredentialsFields';
import TokenWithUserIDCredentialsFields from './credentials/TokenWithUserIDCredentialsFields';
import TokenWithUsernameCredentialsFields from './credentials/TokenWithUsernameCredentialsFields';

const OpenStackAuthenticationTypeField: FC = () => {
  const { t } = useForkliftTranslation();
  const { control } = useCreateProviderFormContext();

  const {
    field: { onChange, value },
  } = useController({
    control,
    defaultValue: OpenstackAuthType.Password,
    name: ProviderFormFieldId.OpenstackAuthType,
  });

  return (
    <FormGroupWithHelpText
      role="radiogroup"
      fieldId={ProviderFormFieldId.OpenstackAuthType}
      label={t('Authentication type')}
      isRequired
    >
      <Stack hasGutter>
        <HelperText>
          <HelperTextItem>
            {t(
              'Method of authentication to use when connecting to the OpenStack Identity (Keystone) server.',
            )}
          </HelperTextItem>
        </HelperText>

        <Radio
          name={ProviderFormFieldId.OpenstackAuthType}
          label={openstackAuthTypeLabels.password}
          id="password"
          isChecked={value === OpenstackAuthType.Password}
          onChange={() => {
            onChange(OpenstackAuthType.Password);
          }}
          body={value === OpenstackAuthType.Password && <PasswordCredentialsFields />}
        />

        <Radio
          name={ProviderFormFieldId.OpenstackAuthType}
          label={openstackAuthTypeLabels.tokenWithUserID}
          id="tokenWithUserId"
          isChecked={value === OpenstackAuthType.TokenWithUserId}
          onChange={() => {
            onChange(OpenstackAuthType.TokenWithUserId);
          }}
          body={value === OpenstackAuthType.TokenWithUserId && <TokenWithUserIDCredentialsFields />}
        />

        <Radio
          name={ProviderFormFieldId.OpenstackAuthType}
          label={openstackAuthTypeLabels.tokenWithUsername}
          id="tokenWithUsername"
          isChecked={value === OpenstackAuthType.TokenWithUsername}
          onChange={() => {
            onChange(OpenstackAuthType.TokenWithUsername);
          }}
          body={
            value === OpenstackAuthType.TokenWithUsername && <TokenWithUsernameCredentialsFields />
          }
        />

        <Radio
          name={ProviderFormFieldId.OpenstackAuthType}
          label={openstackAuthTypeLabels.applicationCredentialId}
          id="applicationCredentialId"
          isChecked={value === OpenstackAuthType.ApplicationCredentialId}
          onChange={() => {
            onChange(OpenstackAuthType.ApplicationCredentialId);
          }}
          body={
            value === OpenstackAuthType.ApplicationCredentialId && (
              <ApplicationCredentialIdCredentialsFields />
            )
          }
        />

        <Radio
          name={ProviderFormFieldId.OpenstackAuthType}
          label={openstackAuthTypeLabels.applicationCredentialName}
          id="applicationCredentialName"
          isChecked={value === OpenstackAuthType.ApplicationCredentialName}
          onChange={() => {
            onChange(OpenstackAuthType.ApplicationCredentialName);
          }}
          body={
            value === OpenstackAuthType.ApplicationCredentialName && (
              <ApplicationCredentialNameCredentialsFields />
            )
          }
        />
      </Stack>
    </FormGroupWithHelpText>
  );
};

export default OpenStackAuthenticationTypeField;

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
      fieldId={ProviderFormFieldId.OpenstackAuthType}
      isRequired
      label={t('Authentication type')}
      role="radiogroup"
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
          body={value === OpenstackAuthType.Password && <PasswordCredentialsFields />}
          id="password"
          isChecked={value === OpenstackAuthType.Password}
          label={openstackAuthTypeLabels.password}
          name={ProviderFormFieldId.OpenstackAuthType}
          onChange={() => {
            onChange(OpenstackAuthType.Password);
          }}
        />

        <Radio
          body={value === OpenstackAuthType.TokenWithUserId && <TokenWithUserIDCredentialsFields />}
          id="tokenWithUserId"
          isChecked={value === OpenstackAuthType.TokenWithUserId}
          label={openstackAuthTypeLabels.tokenWithUserID}
          name={ProviderFormFieldId.OpenstackAuthType}
          onChange={() => {
            onChange(OpenstackAuthType.TokenWithUserId);
          }}
        />

        <Radio
          body={
            value === OpenstackAuthType.TokenWithUsername && <TokenWithUsernameCredentialsFields />
          }
          id="tokenWithUsername"
          isChecked={value === OpenstackAuthType.TokenWithUsername}
          label={openstackAuthTypeLabels.tokenWithUsername}
          name={ProviderFormFieldId.OpenstackAuthType}
          onChange={() => {
            onChange(OpenstackAuthType.TokenWithUsername);
          }}
        />

        <Radio
          body={
            value === OpenstackAuthType.ApplicationCredentialId && (
              <ApplicationCredentialIdCredentialsFields />
            )
          }
          id="applicationCredentialId"
          isChecked={value === OpenstackAuthType.ApplicationCredentialId}
          label={openstackAuthTypeLabels.applicationCredentialId}
          name={ProviderFormFieldId.OpenstackAuthType}
          onChange={() => {
            onChange(OpenstackAuthType.ApplicationCredentialId);
          }}
        />

        <Radio
          body={
            value === OpenstackAuthType.ApplicationCredentialName && (
              <ApplicationCredentialNameCredentialsFields />
            )
          }
          id="applicationCredentialName"
          isChecked={value === OpenstackAuthType.ApplicationCredentialName}
          label={openstackAuthTypeLabels.applicationCredentialName}
          name={ProviderFormFieldId.OpenstackAuthType}
          onChange={() => {
            onChange(OpenstackAuthType.ApplicationCredentialName);
          }}
        />
      </Stack>
    </FormGroupWithHelpText>
  );
};

export default OpenStackAuthenticationTypeField;

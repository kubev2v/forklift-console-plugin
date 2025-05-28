import type { FC } from 'react';
import { FormGroupWithHelpText } from 'src/components/common/FormGroupWithHelpText/FormGroupWithHelpText';
import { OpenstackAuthType, OpenstackSecretFieldsId } from 'src/providers/utils/constants';
import { useForkliftTranslation } from 'src/utils/i18n';

import { Radio } from '@patternfly/react-core';

type AuthenticationTypeRadioGroupProps = {
  authenticationType: OpenstackAuthType;
  handleAuthTypeChange: (type: OpenstackAuthType) => void;
};

const AuthenticationTypeRadioGroup: FC<AuthenticationTypeRadioGroupProps> = ({
  authenticationType,
  handleAuthTypeChange,
}) => {
  const { t } = useForkliftTranslation();

  return (
    <FormGroupWithHelpText
      role="radiogroup"
      fieldId={OpenstackSecretFieldsId.AuthType}
      label={t('Authentication type')}
      helperText={t(
        'Method of authentication to use when connecting to the OpenStack Identity (Keystone) server.',
      )}
    >
      <Radio
        name={OpenstackSecretFieldsId.AuthType}
        label={t('Application credential ID')}
        id="applicationCredentialIdSecretFields"
        isChecked={authenticationType === OpenstackAuthType.ApplicationCredentialIdSecretFields}
        onChange={() => {
          handleAuthTypeChange(OpenstackAuthType.ApplicationCredentialIdSecretFields);
        }}
      />
      <Radio
        name={OpenstackSecretFieldsId.AuthType}
        label={t('Application credential name')}
        id="applicationCredentialNameSecretFields"
        isChecked={authenticationType === OpenstackAuthType.ApplicationCredentialNameSecretFields}
        onChange={() => {
          handleAuthTypeChange(OpenstackAuthType.ApplicationCredentialNameSecretFields);
        }}
      />
      <Radio
        name={OpenstackSecretFieldsId.AuthType}
        label={t('Token with user ID')}
        id="tokenWithUserIDSecretFields"
        isChecked={authenticationType === OpenstackAuthType.TokenWithUserIDSecretFields}
        onChange={() => {
          handleAuthTypeChange(OpenstackAuthType.TokenWithUserIDSecretFields);
        }}
      />
      <Radio
        name={OpenstackSecretFieldsId.AuthType}
        label={t('Token with user name')}
        id="tokenWithUsernameSecretFields"
        isChecked={authenticationType === OpenstackAuthType.TokenWithUsernameSecretFields}
        onChange={() => {
          handleAuthTypeChange(OpenstackAuthType.TokenWithUsernameSecretFields);
        }}
      />
      <Radio
        name={OpenstackSecretFieldsId.AuthType}
        label={t('Password')}
        id="passwordSecretFields"
        isChecked={authenticationType === OpenstackAuthType.PasswordSecretFields}
        onChange={() => {
          handleAuthTypeChange(OpenstackAuthType.PasswordSecretFields);
        }}
      />
    </FormGroupWithHelpText>
  );
};

export default AuthenticationTypeRadioGroup;

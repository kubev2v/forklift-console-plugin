import type { FC } from 'react';
import { FormGroupWithHelpText } from 'src/components/common/FormGroupWithHelpText/FormGroupWithHelpText';
import {
  OpenstackAuthType,
  OpenstackAuthTypeLabels,
  OpenstackSecretFieldsId,
} from 'src/providers/utils/constants';
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
        label={t(OpenstackAuthTypeLabels.ApplicationCredentialId)}
        id="applicationCredentialIdSecretFields"
        isChecked={authenticationType === OpenstackAuthType.ApplicationCredentialIdSecretFields}
        onChange={() => {
          handleAuthTypeChange(OpenstackAuthType.ApplicationCredentialIdSecretFields);
        }}
      />
      <Radio
        name={OpenstackSecretFieldsId.AuthType}
        label={t(OpenstackAuthTypeLabels.ApplicationCredentialName)}
        id="applicationCredentialNameSecretFields"
        isChecked={authenticationType === OpenstackAuthType.ApplicationCredentialNameSecretFields}
        onChange={() => {
          handleAuthTypeChange(OpenstackAuthType.ApplicationCredentialNameSecretFields);
        }}
      />
      <Radio
        name={OpenstackSecretFieldsId.AuthType}
        label={t(OpenstackAuthTypeLabels.TokenWithUserID)}
        id="tokenWithUserIDSecretFields"
        isChecked={authenticationType === OpenstackAuthType.TokenWithUserIDSecretFields}
        onChange={() => {
          handleAuthTypeChange(OpenstackAuthType.TokenWithUserIDSecretFields);
        }}
      />
      <Radio
        name={OpenstackSecretFieldsId.AuthType}
        label={t(OpenstackAuthTypeLabels.TokenWithUsername)}
        id="tokenWithUsernameSecretFields"
        isChecked={authenticationType === OpenstackAuthType.TokenWithUsernameSecretFields}
        onChange={() => {
          handleAuthTypeChange(OpenstackAuthType.TokenWithUsernameSecretFields);
        }}
      />
      <Radio
        name={OpenstackSecretFieldsId.AuthType}
        label={t(OpenstackAuthTypeLabels.Password)}
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

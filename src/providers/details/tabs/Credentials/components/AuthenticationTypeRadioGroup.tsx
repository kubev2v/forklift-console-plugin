import type { FC } from 'react';
import { FormGroupWithHelpText } from 'src/components/common/FormGroupWithHelpText/FormGroupWithHelpText';
import {
  OpenstackAuthType,
  openstackAuthTypeLabels,
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
        label={openstackAuthTypeLabels.applicationCredentialId}
        id={OpenstackAuthType.ApplicationCredentialId}
        isChecked={authenticationType === OpenstackAuthType.ApplicationCredentialId}
        onChange={() => {
          handleAuthTypeChange(OpenstackAuthType.ApplicationCredentialId);
        }}
      />
      <Radio
        name={OpenstackSecretFieldsId.AuthType}
        label={openstackAuthTypeLabels.applicationCredentialName}
        id={OpenstackAuthType.ApplicationCredentialName}
        isChecked={authenticationType === OpenstackAuthType.ApplicationCredentialName}
        onChange={() => {
          handleAuthTypeChange(OpenstackAuthType.ApplicationCredentialName);
        }}
      />
      <Radio
        name={OpenstackSecretFieldsId.AuthType}
        label={openstackAuthTypeLabels.tokenWithUserID}
        id={OpenstackAuthType.TokenWithUserId}
        isChecked={authenticationType === OpenstackAuthType.TokenWithUserId}
        onChange={() => {
          handleAuthTypeChange(OpenstackAuthType.TokenWithUserId);
        }}
      />
      <Radio
        name={OpenstackSecretFieldsId.AuthType}
        label={openstackAuthTypeLabels.tokenWithUsername}
        id={OpenstackAuthType.TokenWithUsername}
        isChecked={authenticationType === OpenstackAuthType.TokenWithUsername}
        onChange={() => {
          handleAuthTypeChange(OpenstackAuthType.TokenWithUsername);
        }}
      />
      <Radio
        name={OpenstackSecretFieldsId.AuthType}
        label={openstackAuthTypeLabels.password}
        id={OpenstackAuthType.Password}
        isChecked={authenticationType === OpenstackAuthType.Password}
        onChange={() => {
          handleAuthTypeChange(OpenstackAuthType.Password);
        }}
      />
    </FormGroupWithHelpText>
  );
};

export default AuthenticationTypeRadioGroup;

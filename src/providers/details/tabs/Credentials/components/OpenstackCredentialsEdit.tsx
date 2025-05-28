import { type FC, type FormEvent, useCallback, useState } from 'react';
import { encode } from 'js-base64';
import { FormGroupWithHelpText } from 'src/components/common/FormGroupWithHelpText/FormGroupWithHelpText';
import type { CredentialsEditModeByTypeProps } from 'src/providers/details/tabs/Credentials/components/utils/types';
import { OpenstackAuthType } from 'src/providers/utils/constants';
import type { ValidationMsg } from 'src/providers/utils/types';
import { useForkliftTranslation } from 'src/utils/i18n';

import { Divider, Form, Radio } from '@patternfly/react-core';

import { getAuthType } from './utils/getAuthType';
import { getDecodedValue } from './utils/getDecodedValue';
import { openstackSecretFieldValidator } from './utils/openstackSecretFieldValidator';
import ApplicationWithIDSecretFieldsEditSection from './ApplicationWithIDSecretFieldsEditSection';
import ApplicationWithNameSecretFieldsEditSection from './ApplicationWithNameSecretFieldsEditSection';
import CertificateEditSection from './CertificateEditSection';
import PasswordSecretFieldsEditSection from './PasswordSecretFieldsEditSection';
import TokenWithUserIDSecretFieldsEditSection from './TokenWithUserIDSecretFieldsEditSection';
import TokenWithUsernameSecretFieldsEditSection from './TokenWithUsernameSecretFieldsEditSection';

const OpenstackCredentialsEdit: FC<CredentialsEditModeByTypeProps> = ({
  onNewSecretChange,
  secret,
}) => {
  const { t } = useForkliftTranslation();

  const url = getDecodedValue(secret?.data?.url);
  const authType = getDecodedValue(secret?.data?.authType);
  const username = getDecodedValue(secret?.data?.username);
  const insecureSkipVerify = getDecodedValue(secret?.data?.insecureSkipVerify);
  const cacert = getDecodedValue(secret?.data?.cacert);

  const initAuthenticationType: OpenstackAuthType = getAuthType(authType, username);

  const [authenticationType, setAuthenticationType] =
    useState<OpenstackAuthType>(initAuthenticationType);
  const [cacertValidation, setCacertValidation] = useState<ValidationMsg>(
    openstackSecretFieldValidator('cacert', cacert!),
  );
  const [insecureSkipVerifyValidation, setInsecureSkipVerifyValidation] = useState<ValidationMsg>(
    openstackSecretFieldValidator('insecureSkipVerify', insecureSkipVerify!),
  );

  const handleChange = useCallback(
    (id: string, value: string) => {
      const validationState = openstackSecretFieldValidator(id, value);

      if (id === 'insecureSkipVerifyValidation') setInsecureSkipVerifyValidation(validationState);
      if (id === 'cacert') setCacertValidation(validationState);

      // don't trim fields that allow spaces
      const encodedValue = id === 'cacert' ? encode(value ?? '') : encode(value?.trim() ?? '');

      onNewSecretChange({ ...secret, data: { ...secret.data, [id]: encodedValue } });
    },
    [onNewSecretChange, secret],
  );

  const handleAuthTypeChange = useCallback(
    (type: OpenstackAuthType) => {
      setAuthenticationType(type);

      switch (type) {
        case OpenstackAuthType.TokenWithUserIDSecretFields:
        case OpenstackAuthType.TokenWithUsernameSecretFields:
          // on change also clean userID and username
          onNewSecretChange({
            ...secret,
            data: {
              ...secret.data,
              authType: encode('token'),
              userID: undefined,
              username: undefined,
            },
          });
          break;
        case OpenstackAuthType.ApplicationCredentialIdSecretFields:
        case OpenstackAuthType.ApplicationCredentialNameSecretFields:
          // on change also clean userID and username
          onNewSecretChange({
            ...secret,
            data: {
              ...secret.data,
              applicationCredentialID: undefined,
              authType: encode('applicationcredential'),
              username: undefined,
            },
          });
          break;
        case OpenstackAuthType.PasswordSecretFields:
        default:
          onNewSecretChange({
            ...secret,
            data: { ...secret.data, authType: encode('password') },
          });
          break;
      }
    },
    [onNewSecretChange, secret],
  );

  const onChangeInsecure: (checked: boolean, event: FormEvent<HTMLInputElement>) => void = (
    checked,
  ) => {
    handleChange('insecureSkipVerify', checked ? 'true' : 'false');
  };

  const onDataChange: (data: string) => void = (data) => {
    handleChange('cacert', data);
  };

  return (
    <Form isWidthLimited className="forklift-section-secret-edit">
      <FormGroupWithHelpText
        role="radiogroup"
        fieldId="authType"
        label={t('Authentication type')}
        helperText={t(
          'Method of authentication to use when connecting to the OpenStack Identity (Keystone) server.',
        )}
      >
        <Radio
          name="authType"
          label="Application credential ID"
          id="applicationCredentialIdSecretFields"
          isChecked={authenticationType === OpenstackAuthType.ApplicationCredentialIdSecretFields}
          onChange={() => {
            handleAuthTypeChange(OpenstackAuthType.ApplicationCredentialIdSecretFields);
          }}
        />
        <Radio
          name="authType"
          label="Application credential name"
          id="applicationCredentialNameSecretFields"
          isChecked={authenticationType === OpenstackAuthType.ApplicationCredentialNameSecretFields}
          onChange={() => {
            handleAuthTypeChange(OpenstackAuthType.ApplicationCredentialNameSecretFields);
          }}
        />
        <Radio
          name="authType"
          label="Token with user ID"
          id="tokenWithUserIDSecretFields"
          isChecked={authenticationType === OpenstackAuthType.TokenWithUserIDSecretFields}
          onChange={() => {
            handleAuthTypeChange(OpenstackAuthType.TokenWithUserIDSecretFields);
          }}
        />
        <Radio
          name="authType"
          label="Token with user name"
          id="tokenWithUsernameSecretFields"
          isChecked={authenticationType === OpenstackAuthType.TokenWithUsernameSecretFields}
          onChange={() => {
            handleAuthTypeChange(OpenstackAuthType.TokenWithUsernameSecretFields);
          }}
        />
        <Radio
          name="authType"
          label="Password"
          id="passwordSecretFields"
          isChecked={authenticationType === OpenstackAuthType.PasswordSecretFields}
          onChange={() => {
            handleAuthTypeChange(OpenstackAuthType.PasswordSecretFields);
          }}
        />
      </FormGroupWithHelpText>

      <Divider />

      {authenticationType === OpenstackAuthType.PasswordSecretFields && (
        <PasswordSecretFieldsEditSection secret={secret} onNewSecretChange={onNewSecretChange} />
      )}
      {authenticationType === OpenstackAuthType.TokenWithUserIDSecretFields && (
        <TokenWithUserIDSecretFieldsEditSection
          secret={secret}
          onNewSecretChange={onNewSecretChange}
        />
      )}
      {authenticationType === OpenstackAuthType.TokenWithUsernameSecretFields && (
        <TokenWithUsernameSecretFieldsEditSection
          secret={secret}
          onNewSecretChange={onNewSecretChange}
        />
      )}
      {authenticationType === OpenstackAuthType.ApplicationCredentialIdSecretFields && (
        <ApplicationWithIDSecretFieldsEditSection
          secret={secret}
          onNewSecretChange={onNewSecretChange}
        />
      )}
      {authenticationType === OpenstackAuthType.ApplicationCredentialNameSecretFields && (
        <ApplicationWithNameSecretFieldsEditSection
          secret={secret}
          onNewSecretChange={onNewSecretChange}
        />
      )}

      <Divider />

      <CertificateEditSection
        insecureSkipVerifyValidation={insecureSkipVerifyValidation}
        insecureSkipVerify={insecureSkipVerify}
        cacertValidation={cacertValidation}
        cacert={cacert}
        url={url}
        onChangeInsecure={onChangeInsecure}
        onDataChange={onDataChange}
      />
    </Form>
  );
};

export default OpenstackCredentialsEdit;

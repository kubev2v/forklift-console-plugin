import { type FC, type FormEvent, useCallback, useState } from 'react';
import { encode } from 'js-base64';
import type { CredentialsEditModeByTypeProps } from 'src/providers/details/tabs/Credentials/components/utils/types';
import { OpenstackAuthType, OpenstackSecretFieldsId } from 'src/providers/utils/constants';

import { Divider, Form } from '@patternfly/react-core';
import type { ValidationMsg } from '@utils/validation/Validation';

import { getAuthType } from './utils/getAuthType';
import { getDecodedValue } from './utils/getDecodedValue';
import { openstackSecretFieldValidator } from './utils/openstackSecretFieldValidator';
import ApplicationWithIDSecretFieldsEditSection from './ApplicationWithIDSecretFieldsEditSection';
import ApplicationWithNameSecretFieldsEditSection from './ApplicationWithNameSecretFieldsEditSection';
import AuthenticationTypeRadioGroup from './AuthenticationTypeRadioGroup';
import CertificateEditSection from './CertificateEditSection';
import PasswordSecretFieldsEditSection from './PasswordSecretFieldsEditSection';
import TokenWithUserIDSecretFieldsEditSection from './TokenWithUserIDSecretFieldsEditSection';
import TokenWithUsernameSecretFieldsEditSection from './TokenWithUsernameSecretFieldsEditSection';

const OpenstackCredentialsEdit: FC<CredentialsEditModeByTypeProps> = ({
  onNewSecretChange,
  secret,
}) => {
  const url = getDecodedValue(secret?.data?.url);
  const authType = getDecodedValue(secret?.data?.authType);
  const username = getDecodedValue(secret?.data?.username);
  const insecureSkipVerify = getDecodedValue(secret?.data?.insecureSkipVerify);
  const cacert = getDecodedValue(secret?.data?.cacert);

  const initAuthenticationType: OpenstackAuthType = getAuthType(authType, username);

  const [authenticationType, setAuthenticationType] =
    useState<OpenstackAuthType>(initAuthenticationType);
  const [cacertValidation, setCacertValidation] = useState<ValidationMsg>(
    openstackSecretFieldValidator(OpenstackSecretFieldsId.CaCert, cacert!),
  );
  const [insecureSkipVerifyValidation, setInsecureSkipVerifyValidation] = useState<ValidationMsg>(
    openstackSecretFieldValidator(OpenstackSecretFieldsId.InsecureSkipVerify, insecureSkipVerify!),
  );

  const handleChange = useCallback(
    (id: OpenstackSecretFieldsId, value: string) => {
      const validationState = openstackSecretFieldValidator(id, value);

      if (id === OpenstackSecretFieldsId.InsecureSkipVerify)
        setInsecureSkipVerifyValidation(validationState);
      if (id === OpenstackSecretFieldsId.CaCert) setCacertValidation(validationState);

      // don't trim fields that allow spaces
      const encodedValue =
        id === OpenstackSecretFieldsId.CaCert ? encode(value ?? '') : encode(value?.trim() ?? '');

      onNewSecretChange({ ...secret, data: { ...secret.data, [id]: encodedValue } });
    },
    [onNewSecretChange, secret],
  );

  const handleAuthTypeChange = useCallback(
    (type: OpenstackAuthType) => {
      setAuthenticationType(type);
      const newData = { ...secret.data };

      switch (type) {
        case OpenstackAuthType.TokenWithUserIDSecretFields:
        case OpenstackAuthType.TokenWithUsernameSecretFields:
          // on change also clean userID and username
          delete newData.userID;
          delete newData.username;

          onNewSecretChange({
            ...secret,
            data: {
              ...newData,
              authType: encode('token'),
            },
          });
          break;
        case OpenstackAuthType.ApplicationCredentialIdSecretFields:
        case OpenstackAuthType.ApplicationCredentialNameSecretFields:
          delete newData.applicationCredentialID;
          delete newData.username;
          onNewSecretChange({
            ...secret,
            data: {
              ...newData,
              authType: encode('applicationcredential'),
            },
          });
          break;
        case OpenstackAuthType.PasswordSecretFields:
        default:
          onNewSecretChange({
            ...secret,
            data: { ...newData, authType: encode('password') },
          });
          break;
      }
    },
    [onNewSecretChange, secret],
  );

  const onChangeInsecure: (event: FormEvent<HTMLInputElement>, checked: boolean) => void = (
    _event,
    checked,
  ) => {
    handleChange(OpenstackSecretFieldsId.InsecureSkipVerify, checked ? 'true' : 'false');
  };

  const onDataChange: (data: string) => void = (data) => {
    handleChange(OpenstackSecretFieldsId.CaCert, data);
  };

  return (
    <Form isWidthLimited className="forklift-section-secret-edit">
      <AuthenticationTypeRadioGroup
        authenticationType={authenticationType}
        handleAuthTypeChange={handleAuthTypeChange}
      />

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

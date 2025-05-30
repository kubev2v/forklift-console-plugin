import { type FC, type FormEvent, useCallback, useState } from 'react';
import { encode } from 'js-base64';
import { FormGroupWithHelpText } from 'src/components/common/FormGroupWithHelpText/FormGroupWithHelpText';
import type { CredentialsEditModeByTypeProps } from 'src/providers/details/tabs/Credentials/components/utils/types';
import type { ValidationMsg } from 'src/providers/utils/types';
import { useForkliftTranslation } from 'src/utils/i18n';

import { Button, Divider, Form, InputGroup, TextInput } from '@patternfly/react-core';
import { EyeIcon, EyeSlashIcon } from '@patternfly/react-icons';

import { getDecodedValue } from './utils/getDecodedValue';
import { vcenterSecretFieldValidator } from './utils/vcenterSecretFieldValidator';
import CertificateEditSection from './CertificateEditSection';

const VCenterCredentialsEdit: FC<CredentialsEditModeByTypeProps> = ({
  onNewSecretChange,
  secret,
}) => {
  const { t } = useForkliftTranslation();

  const url = getDecodedValue(secret?.data?.url);
  const user = getDecodedValue(secret?.data?.user);
  const password = getDecodedValue(secret?.data?.password);
  const insecureSkipVerify = getDecodedValue(secret?.data?.insecureSkipVerify);
  const cacert = getDecodedValue(secret?.data?.cacert);

  const [passwordHidden, setPasswordHidden] = useState<boolean>(true);
  const [userValidation, setUserValidation] = useState<ValidationMsg>(
    vcenterSecretFieldValidator('user', user!),
  );
  const [passwordValidation, setPasswordValidation] = useState<ValidationMsg>(
    vcenterSecretFieldValidator('password', password!),
  );
  const [cacertValidation, setCacertValidation] = useState<ValidationMsg>(
    vcenterSecretFieldValidator('cacert', cacert!),
  );
  const [insecureSkipVerifyValidation, setInsecureSkipVerifyValidation] = useState<ValidationMsg>(
    vcenterSecretFieldValidator('insecureSkipVerify', insecureSkipVerify!),
  );

  const handleChange = useCallback(
    (id: string, value: string) => {
      const validationState = vcenterSecretFieldValidator(id, value);

      if (id === 'user') setUserValidation(validationState);
      if (id === 'password') setPasswordValidation(validationState);
      if (id === 'insecureSkipVerifyValidation') setInsecureSkipVerifyValidation(validationState);
      if (id === 'cacert') setCacertValidation(validationState);

      // don't trim fields that allow spaces
      const encodedValue = id === 'cacert' ? encode(value ?? '') : encode(value?.trim() ?? '');

      onNewSecretChange({ ...secret, data: { ...secret.data, [id]: encodedValue } });
    },
    [secret, onNewSecretChange],
  );

  const togglePasswordHidden = () => {
    setPasswordHidden(!passwordHidden);
  };

  const onChangeUser: (value: string, event: FormEvent<HTMLInputElement>) => void = (value) => {
    handleChange('user', value);
  };

  const onChangePassword: (value: string, event: FormEvent<HTMLInputElement>) => void = (value) => {
    handleChange('password', value);
  };

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
        label={t('Username')}
        isRequired
        fieldId="user"
        helperText={userValidation.msg}
        helperTextInvalid={userValidation.msg}
        validated={userValidation.type}
      >
        <TextInput
          spellCheck="false"
          isRequired
          type="text"
          id="user"
          name="user"
          onChange={(e, value) => {
            onChangeUser(value, e);
          }}
          value={user}
          validated={userValidation.type}
        />
      </FormGroupWithHelpText>
      <FormGroupWithHelpText
        label={t('Password')}
        isRequired
        fieldId="password"
        helperText={passwordValidation.msg}
        helperTextInvalid={passwordValidation.msg}
        validated={passwordValidation.type}
      >
        <InputGroup>
          <TextInput
            spellCheck="false"
            isRequired
            type={passwordHidden ? 'password' : 'text'}
            aria-label="Password input"
            onChange={(e, value) => {
              onChangePassword(value, e);
            }}
            value={password}
            validated={passwordValidation.type}
          />
          <Button
            variant="control"
            onClick={togglePasswordHidden}
            aria-label={passwordHidden ? 'Show password' : 'Hide password'}
          >
            {passwordHidden ? <EyeIcon /> : <EyeSlashIcon />}
          </Button>
        </InputGroup>
      </FormGroupWithHelpText>

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

export default VCenterCredentialsEdit;

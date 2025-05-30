import { type FC, type FormEvent, useCallback, useState } from 'react';
import { encode } from 'js-base64';
import { FormGroupWithHelpText } from 'src/components/common/FormGroupWithHelpText/FormGroupWithHelpText';
import type { CredentialsEditModeByTypeProps } from 'src/providers/details/tabs/Credentials/components/utils/types';
import type { ValidationMsg } from 'src/providers/utils/types';
import { useForkliftTranslation } from 'src/utils/i18n';

import { Button, Divider, Form, InputGroup, TextInput } from '@patternfly/react-core';
import { EyeIcon, EyeSlashIcon } from '@patternfly/react-icons';

import { getDecodedValue } from './utils/getDecodedValue';
import { openshiftSecretFieldValidator } from './utils/openshiftSecretFieldValidator';
import CertificateEditSection from './CertificateEditSection';

const OpenshiftCredentialsEdit: FC<CredentialsEditModeByTypeProps> = ({
  onNewSecretChange,
  secret,
}) => {
  const { t } = useForkliftTranslation();

  const token = getDecodedValue(secret?.data?.token);
  const insecureSkipVerify = getDecodedValue(secret?.data?.insecureSkipVerify);
  const cacert = getDecodedValue(secret?.data?.cacert);
  const url = getDecodedValue(secret?.data?.url);

  const [tokenHidden, setTokenHidden] = useState<boolean>(true);
  const [tokenValidation, setTokenValidation] = useState<ValidationMsg>(
    openshiftSecretFieldValidator('token', token!),
  );
  const [insecureSkipVerifyValidation, setInsecureSkipVerifyValidation] = useState<ValidationMsg>(
    openshiftSecretFieldValidator('insecureSkipVerify', insecureSkipVerify!),
  );
  const [cacertValidation, setCacertValidation] = useState<ValidationMsg>(
    openshiftSecretFieldValidator('cacert', cacert!),
  );

  const handleChange = useCallback(
    (id: string, value: string) => {
      const validationState = openshiftSecretFieldValidator(id, value);

      if (id === 'token') setTokenValidation(validationState);
      if (id === 'insecureSkipVerifyValidation') setInsecureSkipVerifyValidation(validationState);
      if (id === 'cacert') setCacertValidation(validationState);

      // don't trim fields that allow spaces
      const encodedValue = id === 'cacert' ? encode(value ?? '') : encode(value?.trim() ?? '');

      onNewSecretChange({ ...secret, data: { ...secret.data, [id]: encodedValue } });
    },
    [onNewSecretChange, secret],
  );

  const onClickToggleToken = () => {
    setTokenHidden(!tokenHidden);
  };

  const onChangeToken: (value: string, event: FormEvent<HTMLInputElement>) => void = (value) => {
    handleChange('token', value);
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
        label={t('Service account bearer token')}
        isRequired
        fieldId="token"
        helperText={tokenValidation.msg}
        helperTextInvalid={tokenValidation.msg}
        validated={tokenValidation.type}
      >
        <InputGroup>
          <TextInput
            spellCheck="false"
            isRequired
            type={tokenHidden ? 'password' : 'text'}
            aria-label="Token input"
            onChange={(e, value) => {
              onChangeToken(value, e);
            }}
            value={token}
            validated={tokenValidation.type}
          />
          <Button
            variant="control"
            onClick={onClickToggleToken}
            aria-label={tokenHidden ? 'Show token' : 'Hide token'}
          >
            {tokenHidden ? <EyeIcon /> : <EyeSlashIcon />}
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

export default OpenshiftCredentialsEdit;

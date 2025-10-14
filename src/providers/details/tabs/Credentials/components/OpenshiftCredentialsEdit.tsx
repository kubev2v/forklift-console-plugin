import { type FC, type FormEvent, useCallback, useState } from 'react';
import { encode } from 'js-base64';
import { FormGroupWithHelpText } from 'src/components/common/FormGroupWithHelpText/FormGroupWithHelpText';
import type { CredentialsEditModeByTypeProps } from 'src/providers/details/tabs/Credentials/components/utils/types';
import { SecretFieldsId } from 'src/providers/utils/constants';
import { ForkliftTrans, useForkliftTranslation } from 'src/utils/i18n';

import {
  Alert,
  AlertVariant,
  Button,
  ButtonVariant,
  Divider,
  Form,
  InputGroup,
  TextInput,
} from '@patternfly/react-core';
import { EyeIcon, EyeSlashIcon } from '@patternfly/react-icons';
import type { ValidationMsg } from '@utils/validation/Validation';

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
    openshiftSecretFieldValidator(SecretFieldsId.Token, token!),
  );
  const [insecureSkipVerifyValidation, setInsecureSkipVerifyValidation] = useState<ValidationMsg>(
    openshiftSecretFieldValidator(SecretFieldsId.InsecureSkipVerify, insecureSkipVerify!),
  );
  const [cacertValidation, setCacertValidation] = useState<ValidationMsg>(
    openshiftSecretFieldValidator(SecretFieldsId.CaCert, cacert!),
  );

  const handleChange = useCallback(
    (id: SecretFieldsId, value: string) => {
      const validationState = openshiftSecretFieldValidator(id, value);

      if (id === SecretFieldsId.Token) setTokenValidation(validationState);
      if (id === SecretFieldsId.InsecureSkipVerify)
        setInsecureSkipVerifyValidation(validationState);
      if (id === SecretFieldsId.CaCert) setCacertValidation(validationState);

      // don't trim fields that allow spaces
      const encodedValue =
        id === SecretFieldsId.CaCert ? encode(value ?? '') : encode(value?.trim() ?? '');

      onNewSecretChange({ ...secret, data: { ...secret.data, [id]: encodedValue } });
    },
    [onNewSecretChange, secret],
  );

  const onClickToggleToken = () => {
    setTokenHidden(!tokenHidden);
  };

  const onChangeToken: (_event: FormEvent<HTMLInputElement>, value: string) => void = (
    _event,
    value,
  ) => {
    handleChange(SecretFieldsId.Token, value);
  };

  const onChangeInsecure: (_event: FormEvent<HTMLInputElement>, checked: boolean) => void = (
    _event,
    checked,
  ) => {
    handleChange(SecretFieldsId.InsecureSkipVerify, checked ? 'true' : 'false');
  };

  const onDataChange: (data: string) => void = (data) => {
    handleChange(SecretFieldsId.CaCert, data);
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
            onChange={onChangeToken}
            value={token}
            validated={tokenValidation.type}
          />
          <Button
            variant={ButtonVariant.control}
            onClick={onClickToggleToken}
            aria-label={tokenHidden ? 'Show token' : 'Hide token'}
          >
            {tokenHidden ? <EyeIcon /> : <EyeSlashIcon />}
          </Button>
        </InputGroup>
      </FormGroupWithHelpText>

      <Alert
        variant={AlertVariant.info}
        isInline
        title={
          <ForkliftTrans>
            If both 'URL' and 'Service account bearer token' fields are left empty, the local
            OpenShift cluster is used.
          </ForkliftTrans>
        }
      ></Alert>

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

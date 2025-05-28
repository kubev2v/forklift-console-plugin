import { type FC, type FormEvent, useCallback, useState } from 'react';
import { encode } from 'js-base64';
import { FormGroupWithHelpText } from 'src/components/common/FormGroupWithHelpText/FormGroupWithHelpText';
import { OpenstackSecretFieldsId } from 'src/providers/utils/constants';
import type { ValidationMsg } from 'src/providers/utils/types';
import { useForkliftTranslation } from 'src/utils/i18n';

import { Button, InputGroup, TextInput } from '@patternfly/react-core';
import { EyeIcon, EyeSlashIcon } from '@patternfly/react-icons';

import { getDecodedValue } from './utils/getDecodedValue';
import { openstackSecretFieldValidator } from './utils/openstackSecretFieldValidator';
import type { CredentialsEditModeByTypeProps } from './utils/types';

const PasswordSecretFieldsEditSection: FC<CredentialsEditModeByTypeProps> = ({
  onNewSecretChange,
  secret,
}) => {
  const { t } = useForkliftTranslation();

  const username = getDecodedValue(secret?.data?.username);
  const password = getDecodedValue(secret?.data?.password);
  const regionName = getDecodedValue(secret?.data?.regionName);
  const projectName = getDecodedValue(secret?.data?.projectName);
  const domainName = getDecodedValue(secret?.data?.domainName);

  const [passwordHidden, setPasswordHidden] = useState<boolean>(true);

  const [usernameValidation, setUsernameValidation] = useState<ValidationMsg>(
    openstackSecretFieldValidator(OpenstackSecretFieldsId.Username, username!),
  );

  const [passwordValidation, setPasswordValidation] = useState<ValidationMsg>(
    openstackSecretFieldValidator(OpenstackSecretFieldsId.Password, password!),
  );

  const [regionNameValidation, setRegionNameValidation] = useState<ValidationMsg>(
    openstackSecretFieldValidator(OpenstackSecretFieldsId.RegionName, regionName!),
  );
  const [projectNameValidation, setProjectNameValidation] = useState<ValidationMsg>(
    openstackSecretFieldValidator(OpenstackSecretFieldsId.ProjectName, projectName!),
  );

  const [domainNameValidation, setDomainNameValidation] = useState<ValidationMsg>(
    openstackSecretFieldValidator(OpenstackSecretFieldsId.DomainName, domainName!),
  );

  // Define handleChange and validation functions
  const handleChange = useCallback(
    (id: string, value: string) => {
      const validationState = openstackSecretFieldValidator(id, value);

      if (id === OpenstackSecretFieldsId.Username.toString())
        setUsernameValidation(validationState);
      if (id === OpenstackSecretFieldsId.Password.toString())
        setPasswordValidation(validationState);
      if (id === OpenstackSecretFieldsId.RegionName.toString())
        setRegionNameValidation(validationState);
      if (id === OpenstackSecretFieldsId.ProjectName.toString())
        setProjectNameValidation(validationState);
      if (id === OpenstackSecretFieldsId.DomainName.toString())
        setDomainNameValidation(validationState);

      const encodedValue = encode(value?.trim() ?? '');

      onNewSecretChange({ ...secret, data: { ...secret.data, [id]: encodedValue } });
    },
    [secret, onNewSecretChange],
  );

  const onClickTogglePassword = () => {
    setPasswordHidden(!passwordHidden);
  };

  type onChangeFactoryType = (
    changedField: string,
  ) => (value: string, event: FormEvent<HTMLInputElement>) => void;

  const onChangeFactory: onChangeFactoryType = (changedField) => (value) => {
    handleChange(changedField, value);
  };

  return (
    <>
      <FormGroupWithHelpText
        label={t('Username')}
        isRequired
        fieldId={OpenstackSecretFieldsId.Username}
        helperText={usernameValidation.msg}
        helperTextInvalid={usernameValidation.msg}
        validated={usernameValidation.type}
      >
        <TextInput
          spellCheck="false"
          isRequired
          type="text"
          id={OpenstackSecretFieldsId.Username}
          name={OpenstackSecretFieldsId.Username}
          value={username}
          onChange={(e, value) => {
            onChangeFactory(OpenstackSecretFieldsId.Username)(value, e);
          }}
          validated={usernameValidation.type}
        />
      </FormGroupWithHelpText>

      <FormGroupWithHelpText
        label={t('Password')}
        isRequired
        fieldId={OpenstackSecretFieldsId.Password}
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
            value={password}
            onChange={(e, value) => {
              onChangeFactory(OpenstackSecretFieldsId.Password)(value, e);
            }}
            validated={passwordValidation.type}
          />
          <Button
            variant="control"
            onClick={onClickTogglePassword}
            aria-label={passwordHidden ? 'Show password' : 'Hide password'}
          >
            {passwordHidden ? <EyeIcon /> : <EyeSlashIcon />}
          </Button>
        </InputGroup>
      </FormGroupWithHelpText>

      <FormGroupWithHelpText
        label={t('Region')}
        isRequired
        fieldId={OpenstackSecretFieldsId.RegionName}
        helperText={regionNameValidation.msg}
        helperTextInvalid={regionNameValidation.msg}
        validated={regionNameValidation.type}
      >
        <TextInput
          spellCheck="false"
          isRequired
          type="text"
          id={OpenstackSecretFieldsId.RegionName}
          name={OpenstackSecretFieldsId.RegionName}
          value={regionName}
          onChange={(e, value) => {
            onChangeFactory(OpenstackSecretFieldsId.RegionName)(value, e);
          }}
          validated={regionNameValidation.type}
        />
      </FormGroupWithHelpText>

      <FormGroupWithHelpText
        label={t('Project')}
        isRequired
        fieldId={OpenstackSecretFieldsId.ProjectName}
        helperText={projectNameValidation.msg}
        helperTextInvalid={projectNameValidation.msg}
        validated={projectNameValidation.type}
      >
        <TextInput
          spellCheck="false"
          isRequired
          type="text"
          id={OpenstackSecretFieldsId.ProjectName}
          name={OpenstackSecretFieldsId.ProjectName}
          value={projectName}
          onChange={(e, value) => {
            onChangeFactory(OpenstackSecretFieldsId.ProjectName)(value, e);
          }}
          validated={projectNameValidation.type}
        />
      </FormGroupWithHelpText>

      <FormGroupWithHelpText
        label={t('Domain')}
        isRequired
        fieldId={OpenstackSecretFieldsId.DomainName}
        helperText={domainNameValidation.msg}
        helperTextInvalid={domainNameValidation.msg}
        validated={domainNameValidation.type}
      >
        <TextInput
          spellCheck="false"
          isRequired
          type="text"
          id={OpenstackSecretFieldsId.DomainName}
          name={OpenstackSecretFieldsId.DomainName}
          value={domainName}
          onChange={(e, value) => {
            onChangeFactory(OpenstackSecretFieldsId.DomainName)(value, e);
          }}
          validated={domainNameValidation.type}
        />
      </FormGroupWithHelpText>
    </>
  );
};

export default PasswordSecretFieldsEditSection;

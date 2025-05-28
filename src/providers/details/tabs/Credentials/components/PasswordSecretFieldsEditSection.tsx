import { type FC, useCallback, useState } from 'react';
import { encode } from 'js-base64';
import { FormGroupWithHelpText } from 'src/components/common/FormGroupWithHelpText/FormGroupWithHelpText';
import { OpenstackSecretFieldsId } from 'src/providers/utils/constants';
import type { ValidationMsg } from 'src/providers/utils/types';
import { useForkliftTranslation } from 'src/utils/i18n';

import { Button, InputGroup, TextInput } from '@patternfly/react-core';
import { EyeIcon, EyeSlashIcon } from '@patternfly/react-icons';

import { getDecodedValue } from './utils/getDecodedValue';
import { openstackSecretFieldValidator } from './utils/openstackSecretFieldValidator';
import type { CredentialsEditModeByTypeProps, onChangeFactoryType } from './utils/types';
import OpenstackDomainEditItem from './OpenstackDomainEditItem';
import OpenstackProjectEditItem from './OpenstackProjectEditItem';
import OpenstackRegionEditItem from './OpenstackRegionEditItem';
import OpenstackUsernameEditItem from './OpenstackUsernameEditItem';

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

  const handleChange = useCallback(
    (id: OpenstackSecretFieldsId, value: string) => {
      const validationState = openstackSecretFieldValidator(id, value);

      if (id === OpenstackSecretFieldsId.Username) setUsernameValidation(validationState);
      if (id === OpenstackSecretFieldsId.Password) setPasswordValidation(validationState);
      if (id === OpenstackSecretFieldsId.RegionName) setRegionNameValidation(validationState);
      if (id === OpenstackSecretFieldsId.ProjectName) setProjectNameValidation(validationState);
      if (id === OpenstackSecretFieldsId.DomainName) setDomainNameValidation(validationState);

      const encodedValue = encode(value?.trim() ?? '');

      onNewSecretChange({ ...secret, data: { ...secret.data, [id]: encodedValue } });
    },
    [secret, onNewSecretChange],
  );

  const onClickTogglePassword = () => {
    setPasswordHidden(!passwordHidden);
  };

  const onChangeFactory: onChangeFactoryType = (changedField) => (_event, value) => {
    handleChange(changedField as OpenstackSecretFieldsId, value);
  };

  return (
    <>
      <OpenstackUsernameEditItem
        usernameValidation={usernameValidation}
        username={username}
        onChangeFactory={onChangeFactory}
      />

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
            onChange={onChangeFactory(OpenstackSecretFieldsId.Password)}
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

      <OpenstackRegionEditItem
        regionNameValidation={regionNameValidation}
        regionName={regionName}
        onChangeFactory={onChangeFactory}
      />

      <OpenstackProjectEditItem
        projectNameValidation={projectNameValidation}
        projectName={projectName}
        onChangeFactory={onChangeFactory}
      />

      <OpenstackDomainEditItem
        domainNameValidation={domainNameValidation}
        domainName={domainName}
        onChangeFactory={onChangeFactory}
      />
    </>
  );
};

export default PasswordSecretFieldsEditSection;

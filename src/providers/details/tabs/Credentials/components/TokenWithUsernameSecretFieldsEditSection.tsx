import { type FC, useCallback, useState } from 'react';
import { encode } from 'js-base64';
import { FormGroupWithHelpText } from 'src/components/common/FormGroupWithHelpText/FormGroupWithHelpText';
import { OpenstackSecretFieldsId } from 'src/providers/utils/constants';
import { useForkliftTranslation } from 'src/utils/i18n';

import { Button, ButtonVariant, InputGroup, TextInput } from '@patternfly/react-core';
import { EyeIcon, EyeSlashIcon } from '@patternfly/react-icons';
import type { ValidationMsg } from '@utils/validation/Validation';

import { getDecodedValue } from './utils/getDecodedValue';
import { openstackSecretFieldValidator } from './utils/openstackSecretFieldValidator';
import type { CredentialsEditModeByTypeProps, onChangeFactoryType } from './utils/types';
import OpenstackDomainEditItem from './OpenstackDomainEditItem';
import OpenstackProjectEditItem from './OpenstackProjectEditItem';
import OpenstackRegionEditItem from './OpenstackRegionEditItem';
import OpenstackUsernameEditItem from './OpenstackUsernameEditItem';

const TokenWithUsernameSecretFieldsEditSection: FC<CredentialsEditModeByTypeProps> = ({
  onNewSecretChange,
  secret,
}) => {
  const { t } = useForkliftTranslation();

  const token = getDecodedValue(secret?.data?.token);
  const username = getDecodedValue(secret?.data?.username);
  const regionName = getDecodedValue(secret?.data?.regionName);
  const projectName = getDecodedValue(secret?.data?.projectName);
  const domainName = getDecodedValue(secret?.data?.domainName);

  const [passwordHidden, setPasswordHidden] = useState<boolean>(true);
  const [tokenValidation, setTokenValidation] = useState<ValidationMsg>(
    openstackSecretFieldValidator(OpenstackSecretFieldsId.Token, token!),
  );
  const [usernameValidation, setUsernameValidation] = useState<ValidationMsg>(
    openstackSecretFieldValidator(OpenstackSecretFieldsId.Username, username!),
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

      if (id === OpenstackSecretFieldsId.Token) setTokenValidation(validationState);
      if (id === OpenstackSecretFieldsId.Username) setUsernameValidation(validationState);
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

  const onChangeFactory: onChangeFactoryType = (changedField) => (_e, value) => {
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
        label={t('Token')}
        isRequired
        fieldId={OpenstackSecretFieldsId.Token}
        helperText={tokenValidation.msg}
        helperTextInvalid={tokenValidation.msg}
        validated={tokenValidation.type}
      >
        <InputGroup>
          <TextInput
            spellCheck="false"
            isRequired
            type={passwordHidden ? 'password' : 'text'}
            id={OpenstackSecretFieldsId.Token}
            name={OpenstackSecretFieldsId.Token}
            value={token}
            onChange={onChangeFactory(OpenstackSecretFieldsId.Token)}
            validated={tokenValidation.type}
          />
          <Button
            variant={ButtonVariant.control}
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

export default TokenWithUsernameSecretFieldsEditSection;

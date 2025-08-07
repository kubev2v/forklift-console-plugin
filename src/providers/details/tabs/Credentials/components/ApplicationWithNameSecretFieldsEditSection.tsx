import { type FC, useCallback, useState } from 'react';
import { encode } from 'js-base64';
import { FormGroupWithHelpText } from 'src/components/common/FormGroupWithHelpText/FormGroupWithHelpText';
import { OpenstackSecretFieldsId } from 'src/providers/utils/constants';
import type { ValidationMsg } from 'src/providers/utils/types';
import { useForkliftTranslation } from 'src/utils/i18n';

import { Button, ButtonVariant, InputGroup, TextInput } from '@patternfly/react-core';
import { EyeIcon, EyeSlashIcon } from '@patternfly/react-icons';

import { getDecodedValue } from './utils/getDecodedValue';
import { openstackSecretFieldValidator } from './utils/openstackSecretFieldValidator';
import type { CredentialsEditModeByTypeProps, onChangeFactoryType } from './utils/types';
import OpenstackDomainEditItem from './OpenstackDomainEditItem';
import OpenstackProjectEditItem from './OpenstackProjectEditItem';
import OpenstackRegionEditItem from './OpenstackRegionEditItem';
import OpenstackUsernameEditItem from './OpenstackUsernameEditItem';

const ApplicationWithNameSecretFieldsEditSection: FC<CredentialsEditModeByTypeProps> = ({
  onNewSecretChange,
  secret,
}) => {
  const { t } = useForkliftTranslation();

  const applicationCredentialName = getDecodedValue(secret?.data?.applicationCredentialName);
  const applicationCredentialSecret = getDecodedValue(secret?.data?.applicationCredentialSecret);
  const username = getDecodedValue(secret?.data?.username);
  const regionName = getDecodedValue(secret?.data?.regionName);
  const projectName = getDecodedValue(secret?.data?.projectName);
  const domainName = getDecodedValue(secret?.data?.domainName);

  const [passwordHidden, setPasswordHidden] = useState<boolean>(true);
  const [applicationCredentialNameValidation, setApplicationCredentialNameValidation] =
    useState<ValidationMsg>(
      openstackSecretFieldValidator(
        OpenstackSecretFieldsId.ApplicationCredentialName,
        applicationCredentialName!,
      ),
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
  const [applicationCredentialSecretValidation, setApplicationCredentialSecretValidation] =
    useState<ValidationMsg>(
      openstackSecretFieldValidator(
        OpenstackSecretFieldsId.ApplicationCredentialSecret,
        applicationCredentialSecret!,
      ),
    );

  const handleChange = useCallback(
    (id: OpenstackSecretFieldsId, value: string) => {
      const validationState = openstackSecretFieldValidator(id, value);

      if (id === OpenstackSecretFieldsId.ApplicationCredentialName)
        setApplicationCredentialNameValidation(validationState);
      if (id === OpenstackSecretFieldsId.Username) setUsernameValidation(validationState);
      if (id === OpenstackSecretFieldsId.RegionName) setRegionNameValidation(validationState);
      if (id === OpenstackSecretFieldsId.ProjectName) setProjectNameValidation(validationState);
      if (id === OpenstackSecretFieldsId.DomainName) setDomainNameValidation(validationState);
      if (id === OpenstackSecretFieldsId.ApplicationCredentialSecret)
        setApplicationCredentialSecretValidation(validationState);

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
      <FormGroupWithHelpText
        label={t('Application credential name')}
        isRequired
        fieldId={OpenstackSecretFieldsId.ApplicationCredentialName}
        helperText={applicationCredentialNameValidation.msg}
        helperTextInvalid={applicationCredentialNameValidation.msg}
        validated={applicationCredentialNameValidation.type}
      >
        <TextInput
          spellCheck="false"
          isRequired
          type="text"
          id={OpenstackSecretFieldsId.ApplicationCredentialName}
          name={OpenstackSecretFieldsId.ApplicationCredentialName}
          value={applicationCredentialName}
          onChange={onChangeFactory(OpenstackSecretFieldsId.ApplicationCredentialName)}
          validated={applicationCredentialNameValidation.type}
        />
      </FormGroupWithHelpText>

      <FormGroupWithHelpText
        label={t('Application credential secret')}
        isRequired
        fieldId={OpenstackSecretFieldsId.ApplicationCredentialSecret}
        helperText={applicationCredentialSecretValidation.msg}
        helperTextInvalid={applicationCredentialSecretValidation.msg}
        validated={applicationCredentialSecretValidation.type}
      >
        <InputGroup>
          <TextInput
            spellCheck="false"
            isRequired
            type={passwordHidden ? 'password' : 'text'}
            id={OpenstackSecretFieldsId.ApplicationCredentialSecret}
            name={OpenstackSecretFieldsId.ApplicationCredentialSecret}
            value={applicationCredentialSecret}
            onChange={onChangeFactory(OpenstackSecretFieldsId.ApplicationCredentialSecret)}
            validated={applicationCredentialSecretValidation.type}
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

      <OpenstackUsernameEditItem
        usernameValidation={usernameValidation}
        username={username}
        onChangeFactory={onChangeFactory}
      />

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

export default ApplicationWithNameSecretFieldsEditSection;

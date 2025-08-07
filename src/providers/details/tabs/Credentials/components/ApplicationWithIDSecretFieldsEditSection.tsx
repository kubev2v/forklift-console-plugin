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
import OpenstackProjectEditItem from './OpenstackProjectEditItem';
import OpenstackRegionEditItem from './OpenstackRegionEditItem';

const ApplicationWithIDSecretFieldsEditSection: FC<CredentialsEditModeByTypeProps> = ({
  onNewSecretChange,
  secret,
}) => {
  const { t } = useForkliftTranslation();

  const applicationCredentialID = getDecodedValue(secret?.data?.applicationCredentialID);
  const applicationCredentialSecret = getDecodedValue(secret?.data?.applicationCredentialSecret);
  const regionName = getDecodedValue(secret?.data?.regionName);
  const projectName = getDecodedValue(secret?.data?.projectName);

  const [passwordHidden, setPasswordHidden] = useState<boolean>(true);
  const [applicationCredentialIDValidation, setApplicationCredentialIDValidation] =
    useState<ValidationMsg>(
      openstackSecretFieldValidator(
        OpenstackSecretFieldsId.ApplicationCredentialId,
        applicationCredentialID!,
      ),
    );
  const [applicationCredentialSecretValidation, setApplicationCredentialSecretValidation] =
    useState<ValidationMsg>(
      openstackSecretFieldValidator(
        OpenstackSecretFieldsId.ApplicationCredentialSecret,
        applicationCredentialSecret!,
      ),
    );
  const [projectNameValidation, setProjectNameValidation] = useState<ValidationMsg>(
    openstackSecretFieldValidator(OpenstackSecretFieldsId.ProjectName, projectName!),
  );
  const [regionNameValidation, setRegionNameValidation] = useState<ValidationMsg>(
    openstackSecretFieldValidator(OpenstackSecretFieldsId.RegionName, regionName!),
  );

  const handleChange = useCallback(
    (id: OpenstackSecretFieldsId, value: string) => {
      const validationState = openstackSecretFieldValidator(id, value);

      if (id === OpenstackSecretFieldsId.ApplicationCredentialId)
        setApplicationCredentialIDValidation(validationState);
      if (id === OpenstackSecretFieldsId.ApplicationCredentialSecret)
        setApplicationCredentialSecretValidation(validationState);
      if (id === OpenstackSecretFieldsId.ProjectName) setProjectNameValidation(validationState);
      if (id === OpenstackSecretFieldsId.RegionName) setRegionNameValidation(validationState);

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
      <FormGroupWithHelpText
        label={t('Application credential ID')}
        isRequired
        fieldId={OpenstackSecretFieldsId.ApplicationCredentialId}
        helperText={applicationCredentialIDValidation.msg}
        helperTextInvalid={applicationCredentialIDValidation.msg}
        validated={applicationCredentialIDValidation.type}
      >
        <TextInput
          spellCheck="false"
          isRequired
          type="text"
          id={OpenstackSecretFieldsId.ApplicationCredentialId}
          name={OpenstackSecretFieldsId.ApplicationCredentialId}
          value={applicationCredentialID}
          onChange={onChangeFactory(OpenstackSecretFieldsId.ApplicationCredentialId)}
          validated={applicationCredentialIDValidation.type}
        />
      </FormGroupWithHelpText>

      <FormGroupWithHelpText
        label={t('Application credential Secret')}
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
    </>
  );
};

export default ApplicationWithIDSecretFieldsEditSection;

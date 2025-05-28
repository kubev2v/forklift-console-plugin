import { type FC, type FormEvent, useCallback, useState } from 'react';
import { encode } from 'js-base64';
import { OpenstackSecretFieldsId } from 'src/providers/utils/constants';
import type { ValidationMsg } from 'src/providers/utils/types';
import { useForkliftTranslation } from 'src/utils/i18n';

import { FormGroupWithHelpText } from '@components/common/FormGroupWithHelpText/FormGroupWithHelpText';
import { Button, InputGroup, TextInput } from '@patternfly/react-core';
import { EyeIcon, EyeSlashIcon } from '@patternfly/react-icons';

import { getDecodedValue } from './utils/getDecodedValue';
import { openstackSecretFieldValidator } from './utils/openstackSecretFieldValidator';
import type { CredentialsEditModeByTypeProps } from './utils/types';

const TokenWithUserIDSecretFieldsEditSection: FC<CredentialsEditModeByTypeProps> = ({
  onNewSecretChange,
  secret,
}) => {
  const { t } = useForkliftTranslation();

  const token = getDecodedValue(secret?.data?.token);
  const userID = getDecodedValue(secret?.data?.userID);
  const projectID = getDecodedValue(secret?.data?.projectID);
  const regionName = getDecodedValue(secret?.data?.regionName);

  const [passwordHidden, setPasswordHidden] = useState<boolean>(true);

  const [tokenValidation, setTokenValidation] = useState<ValidationMsg>(
    openstackSecretFieldValidator(OpenstackSecretFieldsId.Token, token!),
  );

  const [userIDValidation, setUserIdValidation] = useState<ValidationMsg>(
    openstackSecretFieldValidator(OpenstackSecretFieldsId.UserId, userID!),
  );

  const [projectIDValidation, setProjectIDValidation] = useState<ValidationMsg>(
    openstackSecretFieldValidator(OpenstackSecretFieldsId.ProjectId, projectID!),
  );

  const [regionNameValidation, setRegionNameValidation] = useState<ValidationMsg>(
    openstackSecretFieldValidator(OpenstackSecretFieldsId.RegionName, regionName!),
  );

  const handleChange = useCallback(
    (id: string, value: string) => {
      const validationState = openstackSecretFieldValidator(id, value);

      if (id === OpenstackSecretFieldsId.Token.toString()) setTokenValidation(validationState);
      if (id === OpenstackSecretFieldsId.UserId.toString()) setUserIdValidation(validationState);
      if (id === OpenstackSecretFieldsId.ProjectId.toString())
        setProjectIDValidation(validationState);
      if (id === OpenstackSecretFieldsId.RegionName.toString())
        setRegionNameValidation(validationState);

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
            onChange={(e, value) => {
              onChangeFactory(OpenstackSecretFieldsId.Token)(value, e);
            }}
            validated={tokenValidation.type}
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
        label={t('User ID')}
        isRequired
        fieldId={OpenstackSecretFieldsId.UserId}
        helperText={userIDValidation.msg}
        helperTextInvalid={userIDValidation.msg}
        validated={userIDValidation.type}
      >
        <TextInput
          spellCheck="false"
          isRequired
          type="text"
          id={OpenstackSecretFieldsId.UserId}
          name={OpenstackSecretFieldsId.UserId}
          value={userID}
          onChange={(e, value) => {
            onChangeFactory(OpenstackSecretFieldsId.UserId)(value, e);
          }}
          validated={userIDValidation.type}
        />
      </FormGroupWithHelpText>

      <FormGroupWithHelpText
        label={t('Project ID')}
        isRequired
        fieldId={OpenstackSecretFieldsId.ProjectId}
        helperText={projectIDValidation.msg}
        helperTextInvalid={projectIDValidation.msg}
        validated={projectIDValidation.type}
      >
        <TextInput
          spellCheck="false"
          isRequired
          type="text"
          id={OpenstackSecretFieldsId.ProjectId}
          name={OpenstackSecretFieldsId.ProjectId}
          value={projectID}
          onChange={(e, value) => {
            onChangeFactory(OpenstackSecretFieldsId.ProjectId)(value, e);
          }}
          validated={projectIDValidation.type}
        />
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
    </>
  );
};

export default TokenWithUserIDSecretFieldsEditSection;

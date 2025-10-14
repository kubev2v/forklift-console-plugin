import { type FC, useCallback, useState } from 'react';
import { encode } from 'js-base64';
import { OpenstackSecretFieldsId } from 'src/providers/utils/constants';
import { useForkliftTranslation } from 'src/utils/i18n';

import { FormGroupWithHelpText } from '@components/common/FormGroupWithHelpText/FormGroupWithHelpText';
import { Button, ButtonVariant, InputGroup, TextInput } from '@patternfly/react-core';
import { EyeIcon, EyeSlashIcon } from '@patternfly/react-icons';
import type { ValidationMsg } from '@utils/validation/Validation';

import { getDecodedValue } from './utils/getDecodedValue';
import { openstackSecretFieldValidator } from './utils/openstackSecretFieldValidator';
import type { CredentialsEditModeByTypeProps, onChangeFactoryType } from './utils/types';
import OpenstackRegionEditItem from './OpenstackRegionEditItem';

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
    (id: OpenstackSecretFieldsId, value: string) => {
      const validationState = openstackSecretFieldValidator(id, value);

      if (id === OpenstackSecretFieldsId.Token) setTokenValidation(validationState);
      if (id === OpenstackSecretFieldsId.UserId) setUserIdValidation(validationState);
      if (id === OpenstackSecretFieldsId.ProjectId) setProjectIDValidation(validationState);
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
          onChange={onChangeFactory(OpenstackSecretFieldsId.UserId)}
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
          onChange={onChangeFactory(OpenstackSecretFieldsId.ProjectId)}
          validated={projectIDValidation.type}
        />
      </FormGroupWithHelpText>

      <OpenstackRegionEditItem
        regionNameValidation={regionNameValidation}
        regionName={regionName}
        onChangeFactory={onChangeFactory}
      />
    </>
  );
};

export default TokenWithUserIDSecretFieldsEditSection;

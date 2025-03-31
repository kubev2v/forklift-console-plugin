import React, { useCallback, useReducer } from 'react';
import { Base64 } from 'js-base64';
import { FormGroupWithHelpText } from 'src/components/common/FormGroupWithHelpText/FormGroupWithHelpText';
import { openstackSecretFieldValidator, safeBase64Decode } from 'src/modules/Providers/utils';
import { useForkliftTranslation } from 'src/utils/i18n';

import { Button, InputGroup, TextInput } from '@patternfly/react-core';
import EyeIcon from '@patternfly/react-icons/dist/esm/icons/eye-icon';
import EyeSlashIcon from '@patternfly/react-icons/dist/esm/icons/eye-slash-icon';

import type { EditComponentProps } from '../../BaseCredentialsSection';

import { OpenstackSecretFieldId } from './constants';

export const ApplicationCredentialNameSecretFieldsFormGroup: React.FC<EditComponentProps> = ({
  onChange,
  secret,
}) => {
  const { t } = useForkliftTranslation();

  const applicationCredentialName = safeBase64Decode(secret?.data?.applicationCredentialName);
  const applicationCredentialSecret = safeBase64Decode(secret?.data?.applicationCredentialSecret);
  const username = safeBase64Decode(secret?.data?.username);
  const regionName = safeBase64Decode(secret?.data?.regionName);
  const projectName = safeBase64Decode(secret?.data?.projectName);
  const domainName = safeBase64Decode(secret?.data?.domainName);

  const initialState = {
    passwordHidden: true,
    validation: {
      applicationCredentialName: openstackSecretFieldValidator(
        OpenstackSecretFieldId.ApplicationCredentialName,
        applicationCredentialName,
      ),
      applicationCredentialSecret: openstackSecretFieldValidator(
        OpenstackSecretFieldId.ApplicationCredentialSecret,
        applicationCredentialSecret,
      ),
      domainName: openstackSecretFieldValidator(OpenstackSecretFieldId.DomainName, domainName),
      projectName: openstackSecretFieldValidator(OpenstackSecretFieldId.ProjectName, projectName),
      regionName: openstackSecretFieldValidator(OpenstackSecretFieldId.RegionName, regionName),
      username: openstackSecretFieldValidator(OpenstackSecretFieldId.Username, username),
    },
  };

  const reducer = (state, action) => {
    switch (action.type) {
      case 'SET_FIELD_VALIDATED':
        return {
          ...state,
          validation: {
            ...state.validation,
            [action.payload.field]: action.payload.validationState,
          },
        };
      case 'TOGGLE_PASSWORD_HIDDEN':
        return { ...state, passwordHidden: !state.passwordHidden };
      default:
        return state;
    }
  };

  const [state, dispatch] = useReducer(reducer, initialState);

  // Define handleChange and validation functions
  const handleChange = useCallback(
    (id, value) => {
      const validationState = openstackSecretFieldValidator(id, value);
      dispatch({ payload: { field: id, validationState }, type: 'SET_FIELD_VALIDATED' });

      const encodedValue = Base64.encode(value?.trim() || '');
      onChange({ ...secret, data: { ...secret.data, [id]: encodedValue } });
    },
    [secret, onChange],
  );

  const togglePasswordHidden = () => {
    dispatch({ type: 'TOGGLE_PASSWORD_HIDDEN' });
  };

  type onChangeFactoryType = (
    changedField: string,
  ) => (value: string, event: React.FormEvent<HTMLInputElement>) => void;

  const onChangeFactory: onChangeFactoryType = (changedField) => (value) => {
    handleChange(changedField, value);
  };

  return (
    <>
      <FormGroupWithHelpText
        label={t('Application credential name')}
        isRequired
        fieldId={OpenstackSecretFieldId.ApplicationCredentialName}
        helperText={state.validation.applicationCredentialName.msg}
        helperTextInvalid={state.validation.applicationCredentialName.msg}
        validated={state.validation.applicationCredentialName.type}
      >
        <TextInput
          spellCheck="false"
          isRequired
          type="text"
          id={OpenstackSecretFieldId.ApplicationCredentialName}
          name={OpenstackSecretFieldId.ApplicationCredentialName}
          value={applicationCredentialName}
          onChange={(e, v) => {
            onChangeFactory(OpenstackSecretFieldId.ApplicationCredentialName)(v, e);
          }}
          validated={state.validation.applicationCredentialName.type}
        />
      </FormGroupWithHelpText>

      <FormGroupWithHelpText
        label={t('Application credential secret')}
        isRequired
        fieldId={OpenstackSecretFieldId.ApplicationCredentialSecret}
        helperText={state.validation.applicationCredentialSecret.msg}
        helperTextInvalid={state.validation.applicationCredentialSecret.msg}
        validated={state.validation.applicationCredentialSecret.type}
      >
        <InputGroup>
          <TextInput
            spellCheck="false"
            className="pf-u-w-75"
            isRequired
            type={state.passwordHidden ? 'password' : 'text'}
            id={OpenstackSecretFieldId.ApplicationCredentialSecret}
            name={OpenstackSecretFieldId.ApplicationCredentialSecret}
            value={applicationCredentialSecret}
            onChange={(e, v) => {
              onChangeFactory(OpenstackSecretFieldId.ApplicationCredentialSecret)(v, e);
            }}
            validated={state.validation.applicationCredentialSecret.type}
          />
          <Button
            variant="control"
            onClick={togglePasswordHidden}
            aria-label={state.passwordHidden ? 'Show password' : 'Hide password'}
          >
            {state.passwordHidden ? <EyeIcon /> : <EyeSlashIcon />}
          </Button>
        </InputGroup>
      </FormGroupWithHelpText>

      <FormGroupWithHelpText
        label={t('Username')}
        isRequired
        fieldId={OpenstackSecretFieldId.Username}
        helperText={state.validation.username.msg}
        helperTextInvalid={state.validation.username.msg}
        validated={state.validation.username.type}
      >
        <TextInput
          spellCheck="false"
          isRequired
          type="text"
          id={OpenstackSecretFieldId.Username}
          name={OpenstackSecretFieldId.Username}
          value={username}
          onChange={(e, v) => {
            onChangeFactory(OpenstackSecretFieldId.Username)(v, e);
          }}
          validated={state.validation.username.type}
        />
      </FormGroupWithHelpText>

      <FormGroupWithHelpText
        label={t('Region')}
        isRequired
        fieldId={OpenstackSecretFieldId.RegionName}
        helperText={state.validation.regionName.msg}
        helperTextInvalid={state.validation.regionName.msg}
        validated={state.validation.regionName.type}
      >
        <TextInput
          spellCheck="false"
          isRequired
          type="text"
          id={OpenstackSecretFieldId.RegionName}
          name={OpenstackSecretFieldId.RegionName}
          value={regionName}
          onChange={(e, v) => {
            onChangeFactory(OpenstackSecretFieldId.RegionName)(v, e);
          }}
          validated={state.validation.regionName.type}
        />
      </FormGroupWithHelpText>

      <FormGroupWithHelpText
        label={t('Project')}
        isRequired
        fieldId={OpenstackSecretFieldId.ProjectName}
        helperText={state.validation.projectName.msg}
        helperTextInvalid={state.validation.projectName.msg}
        validated={state.validation.projectName.type}
      >
        <TextInput
          spellCheck="false"
          isRequired
          type="text"
          id={OpenstackSecretFieldId.ProjectName}
          name={OpenstackSecretFieldId.ProjectName}
          value={projectName}
          onChange={(e, v) => {
            onChangeFactory(OpenstackSecretFieldId.ProjectName)(v, e);
          }}
          validated={state.validation.projectName.type}
        />
      </FormGroupWithHelpText>

      <FormGroupWithHelpText
        label={t('Domain')}
        isRequired
        fieldId={OpenstackSecretFieldId.DomainName}
        helperText={state.validation.domainName.msg}
        helperTextInvalid={state.validation.domainName.msg}
        validated={state.validation.domainName.type}
      >
        <TextInput
          spellCheck="false"
          isRequired
          type="text"
          id={OpenstackSecretFieldId.DomainName}
          name={OpenstackSecretFieldId.DomainName}
          value={domainName}
          onChange={(e, v) => {
            onChangeFactory(OpenstackSecretFieldId.DomainName)(v, e);
          }}
          validated={state.validation.domainName.type}
        />
      </FormGroupWithHelpText>
    </>
  );
};

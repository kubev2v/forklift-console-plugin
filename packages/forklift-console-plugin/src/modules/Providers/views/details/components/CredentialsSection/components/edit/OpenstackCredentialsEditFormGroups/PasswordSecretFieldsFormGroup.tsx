import React, { useCallback, useReducer } from 'react';
import { Base64 } from 'js-base64';
import { openstackSecretFieldValidator, safeBase64Decode } from 'src/modules/Providers/utils';
import { useForkliftTranslation } from 'src/utils/i18n';

import { FormGroupWithHelpText } from '@kubev2v/common';
import { Button, TextInput } from '@patternfly/react-core';
import EyeIcon from '@patternfly/react-icons/dist/esm/icons/eye-icon';
import EyeSlashIcon from '@patternfly/react-icons/dist/esm/icons/eye-slash-icon';

import { EditComponentProps } from '../../BaseCredentialsSection';

export const PasswordSecretFieldsFormGroup: React.FC<EditComponentProps> = ({
  secret,
  onChange,
}) => {
  const { t } = useForkliftTranslation();

  const username = safeBase64Decode(secret?.data?.username);
  const password = safeBase64Decode(secret?.data?.password);
  const regionName = safeBase64Decode(secret?.data?.regionName);
  const projectName = safeBase64Decode(secret?.data?.projectName);
  const domainName = safeBase64Decode(secret?.data?.domainName);

  const initialState = {
    passwordHidden: true,
    validation: {
      username: openstackSecretFieldValidator('username', username),
      password: openstackSecretFieldValidator('password', password),
      regionName: openstackSecretFieldValidator('regionName', regionName),
      projectName: openstackSecretFieldValidator('projectName', projectName),
      domainName: openstackSecretFieldValidator('domainName', domainName),
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
      dispatch({ type: 'SET_FIELD_VALIDATED', payload: { field: id, validationState } });

      const encodedValue = Base64.encode(value?.trim() || '');
      onChange({ ...secret, data: { ...secret.data, [id]: encodedValue } });
    },
    [secret, onChange],
  );

  const togglePasswordHidden = () => {
    dispatch({ type: 'TOGGLE_PASSWORD_HIDDEN' });
  };

  return (
    <>
      <FormGroupWithHelpText
        label={t('Username')}
        isRequired
        fieldId="username"
        helperText={state.validation.username.msg}
        helperTextInvalid={state.validation.username.msg}
        validated={state.validation.username.type}
      >
        <TextInput
          isRequired
          type="text"
          id="username"
          name="username"
          value={username}
          onChange={(value) => handleChange('username', value)}
          validated={state.validation.username.type}
        />
      </FormGroupWithHelpText>

      <FormGroupWithHelpText
        label={t('Password')}
        isRequired
        fieldId="password"
        helperText={state.validation.password.msg}
        helperTextInvalid={state.validation.password.msg}
        validated={state.validation.password.type}
      >
        <TextInput
          className="pf-u-w-75"
          isRequired
          type={state.passwordHidden ? 'password' : 'text'}
          aria-label="Password input"
          value={password}
          onChange={(value) => handleChange('password', value)}
          validated={state.validation.password.type}
        />
        <Button
          variant="control"
          onClick={togglePasswordHidden}
          aria-label={state.passwordHidden ? 'Show password' : 'Hide password'}
        >
          {state.passwordHidden ? <EyeIcon /> : <EyeSlashIcon />}
        </Button>
      </FormGroupWithHelpText>

      <FormGroupWithHelpText
        label={t('Region')}
        isRequired
        fieldId="regionName"
        helperText={state.validation.regionName.msg}
        helperTextInvalid={state.validation.regionName.msg}
        validated={state.validation.regionName.type}
      >
        <TextInput
          isRequired
          type="text"
          id="regionName"
          name="regionName"
          value={regionName}
          onChange={(value) => handleChange('regionName', value)}
          validated={state.validation.regionName.type}
        />
      </FormGroupWithHelpText>

      <FormGroupWithHelpText
        label={t('Project')}
        isRequired
        fieldId="projectName"
        helperText={state.validation.projectName.msg}
        helperTextInvalid={state.validation.projectName.msg}
        validated={state.validation.projectName.type}
      >
        <TextInput
          isRequired
          type="text"
          id="projectName"
          name="projectName"
          value={projectName}
          onChange={(value) => handleChange('projectName', value)}
          validated={state.validation.projectName.type}
        />
      </FormGroupWithHelpText>

      <FormGroupWithHelpText
        label={t('Domain')}
        isRequired
        fieldId="domainName"
        helperText={state.validation.domainName.msg}
        helperTextInvalid={state.validation.domainName.msg}
        validated={state.validation.domainName.type}
      >
        <TextInput
          isRequired
          type="text"
          id="domainName"
          name="domainName"
          value={domainName}
          onChange={(value) => handleChange('domainName', value)}
          validated={state.validation.domainName.type}
        />
      </FormGroupWithHelpText>
    </>
  );
};

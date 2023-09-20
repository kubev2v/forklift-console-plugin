import React, { useCallback, useReducer } from 'react';
import { Base64 } from 'js-base64';
import {
  openstackSecretFieldValidator,
  safeBase64Decode,
  Validation,
} from 'src/modules/Providers/utils';
import { useForkliftTranslation } from 'src/utils/i18n';

import { Button, FormGroup, TextInput } from '@patternfly/react-core';
import EyeIcon from '@patternfly/react-icons/dist/esm/icons/eye-icon';
import EyeSlashIcon from '@patternfly/react-icons/dist/esm/icons/eye-slash-icon';

import { EditComponentProps } from '../../BaseCredentialsSection';

export const PasswordSecretFieldsFormGroup: React.FC<EditComponentProps> = ({
  secret,
  onChange,
}) => {
  const { t } = useForkliftTranslation();

  const username = safeBase64Decode(secret?.data?.username || '');
  const password = safeBase64Decode(secret?.data?.password || '');
  const regionName = safeBase64Decode(secret?.data?.regionName || '');
  const projectName = safeBase64Decode(secret?.data?.projectName || '');
  const domainName = safeBase64Decode(secret?.data?.domainName || '');

  const initialState = {
    passwordHidden: true,
    validation: {
      username: 'default' as Validation,
      password: 'default' as Validation,
      regionName: 'default' as Validation,
      projectName: 'default' as Validation,
      domainName: 'default' as Validation,
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

      const encodedValue = Base64.encode(value.trim());
      onChange({ ...secret, data: { ...secret.data, [id]: encodedValue } });
    },
    [secret, onChange],
  );

  const togglePasswordHidden = () => {
    dispatch({ type: 'TOGGLE_PASSWORD_HIDDEN' });
  };

  return (
    <>
      <FormGroup
        label={t('Username')}
        isRequired
        fieldId="username"
        helperText={t('OpenStack REST API user name.')}
        helperTextInvalid={t('Invalid username.')}
        validated={state.validation.username}
      >
        <TextInput
          isRequired
          type="text"
          id="username"
          name="username"
          value={username}
          onChange={(value) => handleChange('username', value)}
          validated={state.validation.username}
        />
      </FormGroup>

      <FormGroup
        label={t('Password')}
        isRequired
        fieldId="password"
        helperText={t('OpenStack REST API password credentials.')}
        helperTextInvalid={t('Invalid password.')}
        validated={state.validation.password}
      >
        <TextInput
          className="pf-u-w-75"
          isRequired
          type={state.passwordHidden ? 'password' : 'text'}
          aria-label="Password input"
          value={password}
          onChange={(value) => handleChange('password', value)}
          validated={state.validation.password}
        />
        <Button
          variant="control"
          onClick={togglePasswordHidden}
          aria-label={state.passwordHidden ? 'Show password' : 'Hide password'}
        >
          {state.passwordHidden ? <EyeIcon /> : <EyeSlashIcon />}
        </Button>
      </FormGroup>

      <FormGroup
        label={t('Region')}
        isRequired
        fieldId="regionName"
        helperText={t('OpenStack region.')}
        helperTextInvalid={t('Invalid region name.')}
        validated={state.validation.regionName}
      >
        <TextInput
          isRequired
          type="text"
          id="regionName"
          name="regionName"
          value={regionName}
          onChange={(value) => handleChange('regionName', value)}
          validated={state.validation.regionName}
        />
      </FormGroup>

      <FormGroup
        label={t('Project')}
        isRequired
        fieldId="projectName"
        helperText={t('OpenStack project.')}
        helperTextInvalid={t('Invalid project name.')}
        validated={state.validation.projectName}
      >
        <TextInput
          isRequired
          type="text"
          id="projectName"
          name="projectName"
          value={projectName}
          onChange={(value) => handleChange('projectName', value)}
          validated={state.validation.projectName}
        />
      </FormGroup>

      <FormGroup
        label={t('Domain')}
        isRequired
        fieldId="domainName"
        helperText={t('OpenStack domain for password credentials.')}
        helperTextInvalid={t('Invalid domain name.')}
        validated={state.validation.domainName}
      >
        <TextInput
          isRequired
          type="text"
          id="domainName"
          name="domainName"
          value={domainName}
          onChange={(value) => handleChange('domainName', value)}
          validated={state.validation.domainName}
        />
      </FormGroup>
    </>
  );
};

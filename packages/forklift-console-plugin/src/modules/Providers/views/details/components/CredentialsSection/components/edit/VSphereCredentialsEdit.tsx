import React, { useCallback, useReducer } from 'react';
import { Base64 } from 'js-base64';
import {
  safeBase64Decode,
  Validation,
  vsphereSecretFieldValidator,
} from 'src/modules/Providers/utils';
import { useForkliftTranslation } from 'src/utils/i18n';

import { Button, Checkbox, Divider, Form, FormGroup, TextInput } from '@patternfly/react-core';
import EyeIcon from '@patternfly/react-icons/dist/esm/icons/eye-icon';
import EyeSlashIcon from '@patternfly/react-icons/dist/esm/icons/eye-slash-icon';

import { EditComponentProps } from '../BaseCredentialsSection';

export const VSphereCredentialsEdit: React.FC<EditComponentProps> = ({ secret, onChange }) => {
  const { t } = useForkliftTranslation();

  const user = safeBase64Decode(secret?.data?.user || '');
  const password = safeBase64Decode(secret?.data?.password || '');
  const thumbprint = safeBase64Decode(secret?.data?.thumbprint || '');
  const insecureSkipVerify = safeBase64Decode(secret?.data?.insecureSkipVerify || '') === 'true';

  const initialState = {
    passwordHidden: true,
    validation: {
      user: 'default' as Validation,
      password: 'default' as Validation,
      thumbprint: 'default' as Validation,
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

  const handleChange = useCallback(
    (id, value) => {
      const validationState = vsphereSecretFieldValidator(id, value);
      dispatch({ type: 'SET_FIELD_VALIDATED', payload: { field: id, validationState } });

      // don't trim fields that allow spaces
      const encodedValue = ['cacert'].includes(id)
        ? Base64.encode(value)
        : Base64.encode(value.trim());

      onChange({ ...secret, data: { ...secret.data, [id]: encodedValue } });
    },
    [secret, onChange],
  );

  const togglePasswordHidden = () => {
    dispatch({ type: 'TOGGLE_PASSWORD_HIDDEN' });
  };

  return (
    <Form isWidthLimited className="forklift-section-secret-edit">
      <FormGroup
        label={t('Username')}
        isRequired
        fieldId="username"
        helperText={t('vSphere REST API user name.')}
        helperTextInvalid={t('Error: Username is required and must be valid.')}
        validated={state.validation.user}
      >
        <TextInput
          isRequired
          type="text"
          id="username"
          name="username"
          onChange={(value) => handleChange('user', value)}
          value={user}
          validated={state.validation.user}
        />
      </FormGroup>
      <FormGroup
        label={t('Password')}
        isRequired
        fieldId="password"
        helperText={t('vSphere REST API password credentials.')}
        helperTextInvalid={t('Error: Password is required and must be valid.')}
        validated={state.validation.password}
      >
        <TextInput
          className="pf-u-w-75"
          isRequired
          type={state.passwordHidden ? 'password' : 'text'}
          aria-label="Password input"
          onChange={(value) => handleChange('password', value)}
          value={password}
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

      <Divider />

      <FormGroup
        label={t('SSHA-1 fingerprint')}
        isRequired
        fieldId="thumbprint"
        helperText={t(
          "The provider currently requires the SHA-1 fingerprint of the vCenter Server's TLS certificate in all circumstances. vSphere calls this the server's thumbprint.",
        )}
        helperTextInvalid={t('Error: Fingerprint is required and must be valid.')}
        validated={state.validation.thumbprint}
      >
        <TextInput
          isRequired
          type="text"
          id="thumbprint"
          name="thumbprint"
          onChange={(value) => handleChange('thumbprint', value)}
          value={thumbprint}
          validated={state.validation.thumbprint}
        />
      </FormGroup>

      <FormGroup
        label={t('Skip certificate validation')}
        fieldId="insecureSkipVerify"
        helperText={t("If true, the provider's REST API TLS certificate won't be validated.")}
        helperTextInvalid={t('Error: This field must be a boolean.')}
        validated={'default'}
      >
        <Checkbox
          id="insecureSkipVerify"
          name="insecureSkipVerify"
          isChecked={insecureSkipVerify}
          onChange={(value) => handleChange('insecureSkipVerify', value ? 'true' : 'false')}
        />
      </FormGroup>
    </Form>
  );
};

import React, { useCallback, useReducer } from 'react';
import { Base64 } from 'js-base64';
import {
  ovirtSecretFieldValidator,
  safeBase64Decode,
  Validation,
} from 'src/modules/Providers/utils';
import { useForkliftTranslation } from 'src/utils/i18n';

import {
  Button,
  Checkbox,
  Divider,
  FileUpload,
  Form,
  FormGroup,
  TextInput,
} from '@patternfly/react-core';
import EyeIcon from '@patternfly/react-icons/dist/esm/icons/eye-icon';
import EyeSlashIcon from '@patternfly/react-icons/dist/esm/icons/eye-slash-icon';

import { EditComponentProps } from '../BaseCredentialsSection';

export const OvirtCredentialsEdit: React.FC<EditComponentProps> = ({ secret, onChange }) => {
  const { t } = useForkliftTranslation();

  const user = safeBase64Decode(secret?.data?.user || '');
  const password = safeBase64Decode(secret?.data?.password || '');
  const insecureSkipVerify = safeBase64Decode(secret?.data?.insecureSkipVerify || '') === 'true';
  const cacert = safeBase64Decode(secret?.data?.cacert || '');

  const initialState = {
    passwordHidden: true,
    validation: {
      user: 'default' as Validation,
      password: 'default' as Validation,
      cacert: 'default' as Validation,
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
      const validationState = ovirtSecretFieldValidator(id, value);
      dispatch({ type: 'SET_FIELD_VALIDATED', payload: { field: id, validationState } });

      // don't trim fields that allow spaces
      const encodedValue = ['cacert'].includes(id)
        ? Base64.encode(value)
        : Base64.encode(value.trim());

      onChange({ ...secret, data: { ...secret.data, [id]: encodedValue } });
    },
    [secret],
  );

  const togglePasswordHidden = () => {
    dispatch({ type: 'TOGGLE_PASSWORD_HIDDEN' });
  };

  return (
    <Form isWidthLimited className="forklift-section-secret-edit">
      <FormGroup
        label={t('Username')}
        isRequired
        fieldId="user"
        helperText={t('RH Virtualization engine REST API user name.')}
        validated={state.validation.user}
        helperTextInvalid={t('Error: Username is required and must be valid.')}
      >
        <TextInput
          isRequired
          type="text"
          id="user"
          name="user"
          value={user}
          validated={state.validation.user}
          onChange={(value) => handleChange('user', value)}
        />
      </FormGroup>
      <FormGroup
        label={t('Password')}
        isRequired
        fieldId="password"
        helperText={t('RH Virtualization engine REST API password credentials.')}
        validated={state.validation.password}
        helperTextInvalid={t('Error: Password is required and must be valid.')}
      >
        <TextInput
          className="pf-u-w-75"
          isRequired
          type={state.passwordHidden ? 'password' : 'text'}
          aria-label="Password input"
          value={password}
          validated={state.validation.password}
          onChange={(value) => handleChange('password', value)}
        />
        <Button
          variant="control"
          onClick={() => togglePasswordHidden()}
          aria-label={state.passwordHidden ? 'Show password' : 'Hide password'}
        >
          {state.passwordHidden ? <EyeIcon /> : <EyeSlashIcon />}
        </Button>
      </FormGroup>

      <Divider />

      <FormGroup
        label={t('Skip certificate validation')}
        fieldId="insecureSkipVerify"
        helperText={t("If true, the provider's REST API TLS certificate won't be validated.")}
        validated={state.validation.insecureSkipVerify}
        helperTextInvalid={t('Error: Insecure Skip Verify must be a boolean value.')}
      >
        <Checkbox
          id="insecureSkipVerify"
          name="insecureSkipVerify"
          isChecked={insecureSkipVerify}
          onChange={(value) => handleChange('insecureSkipVerify', value ? 'true' : 'false')}
        />
      </FormGroup>
      <FormGroup
        label={
          insecureSkipVerify
            ? t('CA certificate - disabled when skip certificate validation is checked')
            : t('CA certificate - leave empty to use system certificates')
        }
        fieldId="cacert"
        helperText={t(
          'Custom certification used to verify the RH Virtualization REST API server, when empty use system certificate.',
        )}
        validated={state.validation.cacert}
        helperTextInvalid={t('Error: CA Certificate must be valid.')}
      >
        <FileUpload
          id="cacert"
          type="text"
          filenamePlaceholder="Drag and drop a file or upload one"
          value={cacert}
          validated={state.validation.cacert}
          onDataChange={(value) => handleChange('cacert', value)}
          onTextChange={(value) => handleChange('cacert', value)}
          onClearClick={() => handleChange('cacert', '')}
          browseButtonText="Upload"
          isDisabled={insecureSkipVerify}
        />
      </FormGroup>
    </Form>
  );
};

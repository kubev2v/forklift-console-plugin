import React, { useCallback, useReducer } from 'react';
import { Base64 } from 'js-base64';
import {
  openstackSecretFieldValidator,
  safeBase64Decode,
  Validation,
} from 'src/modules/Providers/utils';
import { useForkliftTranslation } from 'src/utils/i18n';

import { Checkbox, Divider, FileUpload, Form, FormGroup, Radio } from '@patternfly/react-core';

import { EditComponentProps } from '../BaseCredentialsSection';

import {
  ApplicationCredentialNameSecretFieldsFormGroup,
  ApplicationWithCredentialsIDFormGroup,
  PasswordSecretFieldsFormGroup,
  TokenWithUserIDSecretFieldsFormGroup,
  TokenWithUsernameSecretFieldsFormGroup,
} from './OpenstackCredentialsEditFormGroups';

export const OpenstackCredentialsEdit: React.FC<EditComponentProps> = ({ secret, onChange }) => {
  const { t } = useForkliftTranslation();

  const authType = safeBase64Decode(secret?.data?.authType || '');
  const username = safeBase64Decode(secret?.data?.username || '');
  const insecureSkipVerify = safeBase64Decode(secret?.data?.insecureSkipVerify || '') === 'true';
  const cacert = safeBase64Decode(secret?.data?.cacert || '');

  let authenticationType:
    | 'passwordSecretFields'
    | 'tokenWithUserIDSecretFields'
    | 'tokenWithUsernameSecretFields'
    | 'applicationCredentialIdSecretFields'
    | 'applicationCredentialNameSecretFields';

  // guess initial authenticationType based on authType and username
  switch (authType) {
    case 'password':
      authenticationType = 'passwordSecretFields';
      break;
    case 'token':
      if (username) {
        authenticationType = 'tokenWithUsernameSecretFields';
      } else {
        authenticationType = 'tokenWithUserIDSecretFields';
      }
      break;
    case 'applicationcredential':
      if (username) {
        authenticationType = 'applicationCredentialNameSecretFields';
      } else {
        authenticationType = 'applicationCredentialIdSecretFields';
      }
      break;
    default:
      authenticationType = 'passwordSecretFields';
      break;
  }

  const initialState = {
    authenticationType: authenticationType,
    validation: {
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
      case 'SET_AUTHENTICATION_TYPE':
        return {
          ...state,
          authenticationType: action.payload,
        };
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

      // don't trim fields that allow spaces
      const encodedValue = ['cacert'].includes(id)
        ? Base64.encode(value)
        : Base64.encode(value.trim());

      onChange({ ...secret, data: { ...secret.data, [id]: encodedValue } });
    },
    [secret],
  );

  const handleAuthTypeChange = useCallback(
    (type: string) => {
      dispatch({ type: 'SET_AUTHENTICATION_TYPE', payload: type });

      switch (type) {
        case 'passwordSecretFields':
          onChange({
            ...secret,
            data: { ...secret.data, ['authType']: Base64.encode('password') },
          });
          break;
        case 'tokenWithUserIDSecretFields':
        case 'tokenWithUsernameSecretFields':
          // on change also clean userID and username
          onChange({
            ...secret,
            data: {
              ...secret.data,
              ['authType']: Base64.encode('token'),
              userID: '',
              username: '',
            },
          });
          break;
        case 'applicationCredentialIdSecretFields':
        case 'applicationCredentialNameSecretFields':
          // on change also clean userID and username
          onChange({
            ...secret,
            data: {
              ...secret.data,
              ['authType']: Base64.encode('applicationcredential'),
              applicationCredentialID: '',
              username: '',
            },
          });
          break;
      }
    },
    [secret],
  );

  return (
    <Form isWidthLimited className="forklift-section-secret-edit">
      <FormGroup
        role="radiogroup"
        fieldId="authType"
        label={t('Authentication type')}
        helperText={t('Type of authentication to use when connecting to OpenStack REST API.')}
      >
        <Radio
          name="authType"
          label="Application credential ID"
          id="applicationCredentialIdSecretFields"
          isChecked={state.authenticationType === 'applicationCredentialIdSecretFields'}
          onChange={() => handleAuthTypeChange('applicationCredentialIdSecretFields')}
        />
        <Radio
          name="authType"
          label="Application credential name"
          id="applicationCredentialNameSecretFields"
          isChecked={state.authenticationType === 'applicationCredentialNameSecretFields'}
          onChange={() => handleAuthTypeChange('applicationCredentialNameSecretFields')}
        />
        <Radio
          name="authType"
          label="Token with user ID"
          id="tokenWithUserIDSecretFields"
          isChecked={state.authenticationType === 'tokenWithUserIDSecretFields'}
          onChange={() => handleAuthTypeChange('tokenWithUserIDSecretFields')}
        />
        <Radio
          name="authType"
          label="Token with user name"
          id="tokenWithUsernameSecretFields"
          isChecked={state.authenticationType === 'tokenWithUsernameSecretFields'}
          onChange={() => handleAuthTypeChange('tokenWithUsernameSecretFields')}
        />
        <Radio
          name="authType"
          label="Password"
          id="passwordSecretFields"
          isChecked={state.authenticationType === 'passwordSecretFields'}
          onChange={() => handleAuthTypeChange('passwordSecretFields')}
        />
      </FormGroup>

      <Divider />

      {state.authenticationType === 'passwordSecretFields' && (
        <PasswordSecretFieldsFormGroup secret={secret} onChange={onChange} />
      )}
      {state.authenticationType === 'tokenWithUserIDSecretFields' && (
        <TokenWithUserIDSecretFieldsFormGroup secret={secret} onChange={onChange} />
      )}
      {state.authenticationType === 'tokenWithUsernameSecretFields' && (
        <TokenWithUsernameSecretFieldsFormGroup secret={secret} onChange={onChange} />
      )}
      {state.authenticationType === 'applicationCredentialIdSecretFields' && (
        <ApplicationWithCredentialsIDFormGroup secret={secret} onChange={onChange} />
      )}
      {state.authenticationType === 'applicationCredentialNameSecretFields' && (
        <ApplicationCredentialNameSecretFieldsFormGroup secret={secret} onChange={onChange} />
      )}

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
          'Custom certification used to verify the OpenStack REST API server, when empty use system certificate.',
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

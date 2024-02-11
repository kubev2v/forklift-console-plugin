import React, { useCallback, useReducer } from 'react';
import { Base64 } from 'js-base64';
import {
  openstackSecretFieldValidator,
  safeBase64Decode,
  Validation,
} from 'src/modules/Providers/utils';
import { ForkliftTrans, useForkliftTranslation } from 'src/utils/i18n';

import {
  Divider,
  FileUpload,
  Form,
  FormGroup,
  Popover,
  Radio,
  Switch,
} from '@patternfly/react-core';
import HelpIcon from '@patternfly/react-icons/dist/esm/icons/help-icon';

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

  const insecureSkipVerifyHelperTextMsgs = {
    error: t('Error: this field must be set to a boolean value.'),
    successAndSkipped: t("The provider's CA certificate won't be validated."),
    successAndNotSkipped: t("The provider's CA certificate will be validated."),
  };

  const cacertHelperTextMsgs = {
    error: t(
      'Error: The format of the provided CA certificate is invalid. Ensure the CA certificate format is valid.',
    ),
    success: t(
      'A CA certificate to be trusted when connecting to the OpenStack Identity (Keystone) endpoint. Ensure the CA certificate format is valid. To use a CA certificate, drag the file to the text box or browse for it. To use the system CA certificate, leave the field empty.',
    ),
  };

  const insecureSkipVerifyHelperTextPopover = (
    <ForkliftTrans>
      Note: If <strong>Skip certificate validation</strong> is selected, migrations from this
      provider will not be secure, meaning that the transferred data is sent over an insecure
      connection and potentially sensitive data could be exposed.
    </ForkliftTrans>
  );

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
      insecureSkipVerify: 'default' as Validation,
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
        helperText={t(
          'Method of authentication to use when connecting to the OpenStack Identity (Keystone) server.',
        )}
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
        labelIcon={
          <Popover
            headerContent={<div>Skip certificate validation</div>}
            bodyContent={<div>{insecureSkipVerifyHelperTextPopover}</div>}
            alertSeverityVariant="info"
          >
            <button
              type="button"
              onClick={(e) => e.preventDefault()}
              className="pf-c-form__group-label-help"
            >
              <HelpIcon noVerticalAlign />
            </button>
          </Popover>
        }
        fieldId="insecureSkipVerify"
        validated={state.validation.insecureSkipVerify}
        helperTextInvalid={t('Error: Insecure Skip Verify must be a boolean value.')}
      >
        <Switch
          className="forklift-section-secret-edit-switch"
          id="insecureSkipVerify"
          name="insecureSkipVerify"
          label={insecureSkipVerifyHelperTextMsgs.successAndSkipped}
          labelOff={insecureSkipVerifyHelperTextMsgs.successAndNotSkipped}
          aria-label={insecureSkipVerifyHelperTextMsgs.successAndSkipped}
          isChecked={insecureSkipVerify}
          hasCheckIcon
          onChange={(value) => handleChange('insecureSkipVerify', value ? 'true' : 'false')}
        />
      </FormGroup>
      <FormGroup
        label={
          insecureSkipVerify
            ? t("CA certificate - disabled when 'Skip certificate validation' is selected")
            : t('CA certificate - leave empty to use system CA certificates')
        }
        fieldId="cacert"
        helperText={cacertHelperTextMsgs.success}
        validated={state.validation.cacert}
        helperTextInvalid={cacertHelperTextMsgs.error}
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

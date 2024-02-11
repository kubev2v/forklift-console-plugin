import React, { useCallback, useReducer } from 'react';
import { Base64 } from 'js-base64';
import {
  safeBase64Decode,
  Validation,
  vsphereSecretFieldValidator,
} from 'src/modules/Providers/utils';
import { ForkliftTrans, useForkliftTranslation } from 'src/utils/i18n';

import {
  Button,
  Divider,
  FileUpload,
  Form,
  FormGroup,
  Popover,
  Switch,
  TextInput,
} from '@patternfly/react-core';
import EyeIcon from '@patternfly/react-icons/dist/esm/icons/eye-icon';
import EyeSlashIcon from '@patternfly/react-icons/dist/esm/icons/eye-slash-icon';
import HelpIcon from '@patternfly/react-icons/dist/esm/icons/help-icon';

import { EditComponentProps } from '../BaseCredentialsSection';

export const VSphereCredentialsEdit: React.FC<EditComponentProps> = ({ secret, onChange }) => {
  const { t } = useForkliftTranslation();

  const user = safeBase64Decode(secret?.data?.user || '');
  const password = safeBase64Decode(secret?.data?.password || '');
  const cacert = safeBase64Decode(secret?.data?.cacert || '');
  const insecureSkipVerify = safeBase64Decode(secret?.data?.insecureSkipVerify || '') === 'true';

  const cacertHelperTextMsgs = {
    error: t(
      'Error: The format of the provided CA certificate is invalid. Ensure the CA certificate format is in a PEM encoded X.509 format.',
    ),
    success: t(
      'A CA certificate to be trusted when connecting to the vCenter API endpoint. Ensure the CA certificate format is in a PEM encoded X.509 format. To use a CA certificate, drag the file to the text box or browse for it. To use the system CA certificate, leave the field empty.',
    ),
  };

  const cacertHelperTextPopover = (
    <ForkliftTrans>
      Note: Use the Manager CA certificate unless it was replaced by a third-party certificate, in
      which case use the Manager Apache CA certificate.
    </ForkliftTrans>
  );

  const usernameHelperTextMsgs = {
    error: (
      <div className="forklift-page-provider-field-error-validation">
        <ForkliftTrans>
          Error: The format of the provided username is invalid. Ensure the username does not
          include spaces.
        </ForkliftTrans>
      </div>
    ),
    warning: (
      <div className="forklift-page-provider-field-warning-validation">
        <ForkliftTrans>
          Warning: The provided username does not include the user domain. Ensure the username
          includes the domain. For example: <strong>user@vsphere.local</strong>.
        </ForkliftTrans>
      </div>
    ),
    success: (
      <div className="forklift-page-provider-field-success-validation">
        <ForkliftTrans>
          A username for connecting to the vCenter API endpoint. Ensure the username includes the
          user domain. For example: <strong>user@vsphere.local</strong>.
        </ForkliftTrans>
      </div>
    ),
    default: (
      <div className="forklift-page-provider-field-default-validation">
        <ForkliftTrans>
          A username for connecting to the vCenter API endpoint. Ensure the username includes the
          user domain. For example: <strong>user@vsphere.local</strong>.
        </ForkliftTrans>
      </div>
    ),
  };

  const passwordHelperTextMsgs = {
    error: t(
      'Error: The format of the provided user password is invalid. Ensure the user password does not include spaces.',
    ),
    success: t('A user password for connecting to the vCenter API endpoint.'),
  };

  const initialState = {
    passwordHidden: true,
    validation: {
      user: 'default' as Validation,
      userHelperText: usernameHelperTextMsgs.default,
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

      // The 'warning' validation state is currently supported only for the 'username' field.
      switch (id) {
        case 'user':
          dispatch({
            type: 'SET_FIELD_VALIDATED',
            payload: {
              field: 'userHelperText',
              validationState: usernameHelperTextMsgs[validationState],
            },
          });
          break;
        default:
          break;
      }

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
        helperText={state.validation.userHelperText}
        helperTextInvalid={state.validation.userHelperText}
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
        helperText={passwordHelperTextMsgs.success}
        helperTextInvalid={passwordHelperTextMsgs.error}
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
        label={t('Skip certificate validation')}
        fieldId="insecureSkipVerify"
        helperTextInvalid={t('Error: This field must be a boolean.')}
        validated={'default'}
      >
        <Switch
          className="forklift-section-secret-edit-switch"
          id="insecureSkipVerify"
          name="insecureSkipVerify"
          label={t("The provider's REST API TLS certificate won't be validated.")}
          labelOff={t("The provider's REST API TLS certificate will be validated.")}
          aria-label={t("The provider's REST API TLS certificate won't be validated.")}
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
        labelIcon={
          <Popover
            headerContent={<div>CA certificate</div>}
            bodyContent={<div>{cacertHelperTextPopover}</div>}
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

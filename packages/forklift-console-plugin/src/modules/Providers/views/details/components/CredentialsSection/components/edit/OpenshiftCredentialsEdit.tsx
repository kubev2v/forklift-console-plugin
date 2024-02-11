import React, { useCallback, useReducer } from 'react';
import { Base64 } from 'js-base64';
import {
  openshiftSecretFieldValidator,
  safeBase64Decode,
  Validation,
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

export const OpenshiftCredentialsEdit: React.FC<EditComponentProps> = ({ secret, onChange }) => {
  const { t } = useForkliftTranslation();

  const token = safeBase64Decode(secret?.data?.token || '');
  const insecureSkipVerify = safeBase64Decode(secret?.data?.insecureSkipVerify || '') === 'true';
  const cacert = safeBase64Decode(secret?.data?.cacert || '');

  const tokenHelperTextMsgs = {
    error: (
      <div className="forklift-page-provider-field-error-validation">
        <ForkliftTrans>
          Error: The format of the provided token is invalid. Ensure the token is a valid Kubernetes
          service account token.
        </ForkliftTrans>
      </div>
    ),
    success: (
      <div className="forklift-page-provider-field-success-validation">
        <ForkliftTrans>
          A service account token with cluster admin privileges, required for authenticating the
          connection to the API server.
        </ForkliftTrans>
      </div>
    ),
    default: (
      <div className="forklift-page-provider-field-default-validation">
        <ForkliftTrans>
          A service account token with cluster admin privileges, required for authenticating the
          connection to the API server.
        </ForkliftTrans>
      </div>
    ),
  };

  const insecureSkipVerifyHelperTextMsgs = {
    error: t('Error: this field must be set to a boolean value.'),
    successAndSkipped: t("The provider's CA certificate won't be validated."),
    successAndNotSkipped: t("The provider's CA certificate will be validated."),
  };

  const cacertHelperTextMsgs = {
    error: t(
      'Error: The format of the provided CA certificate is invalid. Ensure the CA certificate format is in a PEM encoded X.509 format.',
    ),
    success: t(
      'A CA certificate to be trusted when connecting to Openshift API endpoint. Ensure the CA certificate format is in a PEM encoded X.509 format. To use a CA certificate, drag the file to the text box or browse for it. To use the system CA certificate, leave the field empty.',
    ),
  };

  const insecureSkipVerifyHelperTextPopover = (
    <ForkliftTrans>
      Note: If <strong>Skip certificate validation</strong> is selected, migrations from this
      provider will not be secure, meaning that the transferred data is sent over an insecure
      connection and potentially sensitive data could be exposed.
    </ForkliftTrans>
  );

  const cacertHelperTextPopover = (
    <ForkliftTrans>
      Note: Use the Manager CA certificate unless it was replaced by a third-party certificate, in
      which case use the Manager Apache CA certificate.
    </ForkliftTrans>
  );

  const initialState = {
    passwordHidden: true,
    validation: {
      token: 'default' as Validation,
      tokenHelperText: tokenHelperTextMsgs.default,
      insecureSkipVerify: 'default' as Validation,
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
      const validationState = openshiftSecretFieldValidator(id, value);
      dispatch({ type: 'SET_FIELD_VALIDATED', payload: { field: id, validationState } });

      switch (id) {
        case 'token':
          dispatch({
            type: 'SET_FIELD_VALIDATED',
            payload: {
              field: 'tokenHelperText',
              validationState: tokenHelperTextMsgs[validationState],
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
    [secret],
  );

  // Handle password hide/reveal click
  function togglePasswordHidden() {
    dispatch({ type: 'TOGGLE_PASSWORD_HIDDEN' });
  }

  return (
    <Form isWidthLimited className="forklift-section-secret-edit">
      <FormGroup
        label={t('Service account bearer token')}
        isRequired
        fieldId="token"
        helperText={state.validation.tokenHelperText}
        validated={state.validation.token}
        helperTextInvalid={state.validation.tokenHelperText}
      >
        <TextInput
          className="pf-u-w-75"
          isRequired
          type={state.passwordHidden ? 'password' : 'text'}
          aria-label="Token input"
          onChange={(value) => handleChange('token', value)}
          value={token}
          validated={state.validation.token}
        />
        <Button
          variant="control"
          onClick={() => togglePasswordHidden()}
          aria-label={state.passwordHidden ? 'Show token' : 'Hide token'}
        >
          {state.passwordHidden ? <EyeIcon /> : <EyeSlashIcon />}
        </Button>
      </FormGroup>

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
        helperTextInvalid={insecureSkipVerifyHelperTextMsgs.error}
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

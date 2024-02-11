import React, { useCallback, useReducer } from 'react';
import { Base64 } from 'js-base64';
import {
  ovirtSecretFieldValidator,
  safeBase64Decode,
  Validation,
} from 'src/modules/Providers/utils';
import { ForkliftTrans, useForkliftTranslation } from 'src/utils/i18n';

import { ExternalLink } from '@kubev2v/common';
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

export const OvirtCredentialsEdit: React.FC<EditComponentProps> = ({ secret, onChange }) => {
  const { t } = useForkliftTranslation();

  const user = safeBase64Decode(secret?.data?.user || '');
  const password = safeBase64Decode(secret?.data?.password || '');
  const insecureSkipVerify = safeBase64Decode(secret?.data?.insecureSkipVerify || '') === 'true';
  const cacert = safeBase64Decode(secret?.data?.cacert || '');

  const usernameHelperTextMsgs = {
    error: t(
      'Error: The format of the provided username is invalid. Ensure the username does not include spaces.',
    ),
    warning: t(
      'Warning: The provided username does not include the user domain. Ensure the username is in the format of username@user-domain. For example: admin@internal.',
    ),
    success: t(
      'A username for connecting to the Red Hat Virtualization Manager (RHVM) API endpoint. Ensure the username is in the format of username@user-domain. For example: admin@internal.',
    ),
  };

  const passwordHelperTextMsgs = {
    error: t(
      'Error: The format of the provided user password is invalid. Ensure the user password does not include spaces.',
    ),
    success: t(
      'A user password for connecting to the Red Hat Virtualization Manager (RHVM) API endpoint.',
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
      'A CA certificate to be trusted when connecting to the Red Hat Virtualization Manager (RHVM) API endpoint. Ensure the CA certificate format is in a PEM encoded X.509 format. To use a CA certificate, drag the file to the text box or browse for it. To use the system CA certificate, leave the field empty.',
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
      <br />
      <br />
      You can retrieve the Manager CA certificate at:
      <br />
      <ExternalLink
        href="https://<rhv-host-example.com>/ovirt-engine/services/pki-resource?resource=ca-certificate&format=X509-PEM-CA"
        isInline
        hideIcon
      >
        https://&#8249;rhv-host-example.com&#8250;/ovirt-engine/services/pki-resource?resource=ca-certificate&format=X509-PEM-CA
      </ExternalLink>
      {' .'}
    </ForkliftTrans>
  );

  const initialState = {
    passwordHidden: true,
    validation: {
      user: 'default' as Validation,
      password: 'default' as Validation,
      insecureSkipVerify: 'default' as Validation,
      cacert: 'default' as Validation,
      // The 'warning' validation state is currently supported only for the 'user' field.
      userHelperText: usernameHelperTextMsgs.success,
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
      dispatch({
        type: 'SET_FIELD_VALIDATED',
        payload: { field: id, validationState },
      });

      // The 'warning' validation state is currently supported only for the 'user' field.
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
        helperText={state.validation.userHelperText}
        validated={state.validation.user}
        helperTextInvalid={state.validation.userHelperText}
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
        helperText={passwordHelperTextMsgs.success}
        validated={state.validation.password}
        helperTextInvalid={passwordHelperTextMsgs.error}
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

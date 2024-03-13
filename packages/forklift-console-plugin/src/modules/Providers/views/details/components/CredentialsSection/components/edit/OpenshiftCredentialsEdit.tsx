import React, { useCallback, useReducer } from 'react';
import { Base64 } from 'js-base64';
import { openshiftSecretFieldValidator, safeBase64Decode } from 'src/modules/Providers/utils';
import { CertificateUpload } from 'src/modules/Providers/utils/components/CertificateUpload';
import { ForkliftTrans, useForkliftTranslation } from 'src/utils/i18n';

import {
  Button,
  Divider,
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

  const url = safeBase64Decode(secret?.data?.url || '');
  const token = safeBase64Decode(secret?.data?.token || '');
  const insecureSkipVerify = safeBase64Decode(secret?.data?.insecureSkipVerify || '') === 'true';
  const cacert = safeBase64Decode(secret?.data?.cacert || '');

  const insecureSkipVerifyHelperTextPopover = (
    <ForkliftTrans>
      <p>
        Select <strong>Skip certificate validation</strong> to skip certificate verification, which
        proceeds with an insecure migration and then the certificate is not required. Insecure
        migration means that the transferred data is sent over an insecure connection and
        potentially sensitive data could be exposed.
      </p>
    </ForkliftTrans>
  );

  const cacertHelperTextPopover = (
    <ForkliftTrans>
      <p>
        Use the CA certificate of the Manager unless it was replaced by a third-party certificate,
        in which case enter the Manager Apache CA certificate.
      </p>
      <p>When left empty the system CA certificate is used.</p>
      <p>
        The certificate is not verified when <strong>Skip certificate validation</strong> is set.
      </p>
    </ForkliftTrans>
  );

  const initialState = {
    passwordHidden: true,
    validation: {
      token: {
        type: 'default',
        msg: 'A service account token, required for authenticating the the connection to the API server.',
      },
      insecureSkipVerify: { type: 'default', msg: 'Migrate without validating a CA certificate' },
      cacert: {
        type: 'default',
        msg: 'The Manager CA certificate unless it was replaced by a third-party certificate, in which case, enter the Manager Apache CA certificate.',
      },
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
        helperText={state.validation.token.msg}
        helperTextInvalid={state.validation.token.msg}
        validated={state.validation.token.type}
      >
        <TextInput
          className="pf-u-w-75"
          isRequired
          type={state.passwordHidden ? 'password' : 'text'}
          aria-label="Token input"
          onChange={(value) => handleChange('token', value)}
          value={token}
          validated={state.validation.token.type}
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
            headerContent={t('Skip certificate validation')}
            bodyContent={insecureSkipVerifyHelperTextPopover}
            alertSeverityVariant="info"
          >
            <button
              type="button"
              onClick={(e) => e.preventDefault()}
              className="pf-c-form__group-label-help"
            >
              <HelpIcon />
            </button>
          </Popover>
        }
        fieldId="insecureSkipVerify"
        validated={state.validation.insecureSkipVerify.type}
        helperText={state.validation.insecureSkipVerify.msg}
        helperTextInvalid={state.validation.insecureSkipVerify.msg}
      >
        <Switch
          className="forklift-section-secret-edit-switch"
          id="insecureSkipVerify"
          name="insecureSkipVerify"
          label={t('Migrate without validating a CA certificate')}
          isChecked={insecureSkipVerify}
          hasCheckIcon
          onChange={(value) => handleChange('insecureSkipVerify', value ? 'true' : 'false')}
        />
      </FormGroup>

      <FormGroup
        label={t('CA certificate')}
        labelIcon={
          <Popover
            headerContent={t('CA certificate')}
            bodyContent={cacertHelperTextPopover}
            alertSeverityVariant="info"
          >
            <button
              type="button"
              onClick={(e) => e.preventDefault()}
              className="pf-c-form__group-label-help"
            >
              <HelpIcon />
            </button>
          </Popover>
        }
        fieldId="cacert"
        helperText={state.validation.cacert.msg}
        helperTextInvalid={state.validation.cacert.msg}
        validated={state.validation.cacert.type}
      >
        <CertificateUpload
          id="cacert"
          type="text"
          filenamePlaceholder="Drag and drop a file or upload one"
          value={cacert}
          validated={state.validation.cacert.type}
          onDataChange={(value) => handleChange('cacert', value)}
          onTextChange={(value) => handleChange('cacert', value)}
          onClearClick={() => handleChange('cacert', '')}
          browseButtonText="Upload"
          url={url}
          isDisabled={insecureSkipVerify}
        />
      </FormGroup>
    </Form>
  );
};

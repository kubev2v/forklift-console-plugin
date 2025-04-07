import { type FC, type FormEvent, type MouseEvent, useCallback, useReducer } from 'react';
import { Base64 } from 'js-base64';
import { FormGroupWithHelpText } from 'src/components/common/FormGroupWithHelpText/FormGroupWithHelpText';
import { CertificateUpload } from 'src/modules/Providers/utils/components/CertificateUpload/CertificateUpload';
import { safeBase64Decode } from 'src/modules/Providers/utils/helpers/safeBase64Decode';
import { ovirtSecretFieldValidator } from 'src/modules/Providers/utils/validators/provider/ovirt/ovirtSecretFieldValidator';
import { ForkliftTrans, useForkliftTranslation } from 'src/utils/i18n';

import {
  Button,
  Divider,
  Form,
  InputGroup,
  Popover,
  Switch,
  TextInput,
} from '@patternfly/react-core';
import EyeIcon from '@patternfly/react-icons/dist/esm/icons/eye-icon';
import EyeSlashIcon from '@patternfly/react-icons/dist/esm/icons/eye-slash-icon';
import HelpIcon from '@patternfly/react-icons/dist/esm/icons/help-icon';

import type { EditComponentProps } from '../BaseCredentialsSection';

export const OvirtCredentialsEdit: FC<EditComponentProps> = ({ onChange, secret }) => {
  const { t } = useForkliftTranslation();

  const url = safeBase64Decode(secret?.data?.url);
  const user = safeBase64Decode(secret?.data?.user);
  const password = safeBase64Decode(secret?.data?.password);
  const insecureSkipVerify = safeBase64Decode(secret?.data?.insecureSkipVerify);
  const cacert = safeBase64Decode(secret?.data?.cacert);

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
        in which case enter the Manager Apache CA certificate. You can retrieve the Manager CA
        certificate at
        https://[engine_host]/ovirt-engine/services/pki-resource?resource=ca-certificate&format=X509-PEM-CA.
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
      cacert: ovirtSecretFieldValidator('cacert', cacert),
      insecureSkipVerify: ovirtSecretFieldValidator('insecureSkipVerify', insecureSkipVerify),
      password: ovirtSecretFieldValidator('password', password),
      user: ovirtSecretFieldValidator('user', user),
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
        payload: { field: id, validationState },
        type: 'SET_FIELD_VALIDATED',
      });

      // don't trim fields that allow spaces
      const encodedValue = ['cacert'].includes(id)
        ? Base64.encode(value || '')
        : Base64.encode(value?.trim() || '');

      onChange({ ...secret, data: { ...secret.data, [id]: encodedValue } });
    },
    [secret],
  );

  const togglePasswordHidden = () => {
    dispatch({ type: 'TOGGLE_PASSWORD_HIDDEN' });
  };

  const onClickEventPreventDef: (event: MouseEvent<HTMLButtonElement>) => void = (event) => {
    event.preventDefault();
  };

  const onClickTogglePassword = () => {
    togglePasswordHidden();
  };

  const onChangeUser: (value: string, event: FormEvent<HTMLInputElement>) => void = (value) => {
    handleChange('user', value);
  };

  const onChangePassword: (value: string, event: FormEvent<HTMLInputElement>) => void = (value) => {
    handleChange('password', value);
  };

  const onChangeInsecure: (checked: boolean, event: FormEvent<HTMLInputElement>) => void = (
    checked,
  ) => {
    handleChange('insecureSkipVerify', checked ? 'true' : 'false');
  };

  const onDataChange: (data: string) => void = (data) => {
    handleChange('cacert', data);
  };

  const onTextChange: (text: string) => void = (text) => {
    handleChange('cacert', text);
  };

  return (
    <Form isWidthLimited className="forklift-section-secret-edit">
      <FormGroupWithHelpText
        label={t('Username')}
        isRequired
        fieldId="user"
        helperText={state.validation.user.msg}
        helperTextInvalid={state.validation.user.msg}
        validated={state.validation.user.type}
      >
        <TextInput
          spellCheck="false"
          isRequired
          type="text"
          id="user"
          name="user"
          value={user}
          validated={state.validation.user.type}
          onChange={(e, value) => {
            onChangeUser(value, e);
          }}
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
        <InputGroup>
          <TextInput
            spellCheck="false"
            className="pf-u-w-75"
            isRequired
            type={state.passwordHidden ? 'password' : 'text'}
            aria-label="Password input"
            value={password}
            validated={state.validation.password.type}
            onChange={(e, value) => {
              onChangePassword(value, e);
            }}
          />
          <Button
            variant="control"
            onClick={onClickTogglePassword}
            aria-label={state.passwordHidden ? 'Show password' : 'Hide password'}
          >
            {state.passwordHidden ? <EyeIcon /> : <EyeSlashIcon />}
          </Button>
        </InputGroup>
      </FormGroupWithHelpText>

      <Divider />

      <FormGroupWithHelpText
        label={t('Skip certificate validation')}
        labelIcon={
          <Popover
            headerContent={t('Skip certificate validation')}
            bodyContent={insecureSkipVerifyHelperTextPopover}
            alertSeverityVariant="info"
          >
            <button
              type="button"
              onClick={onClickEventPreventDef}
              className="pf-c-form__group-label-help"
            >
              <HelpIcon />
            </button>
          </Popover>
        }
        fieldId="insecureSkipVerify"
        validated={state.validation.insecureSkipVerify.type}
        helperTextInvalid={state.validation.insecureSkipVerify.msg}
      >
        <Switch
          className="forklift-section-secret-edit-switch"
          id="insecureSkipVerify"
          name="insecureSkipVerify"
          label={t('Skip certificate validation')}
          isChecked={insecureSkipVerify === 'true'}
          hasCheckIcon
          onChange={(e, value) => {
            onChangeInsecure(value, e);
          }}
        />
      </FormGroupWithHelpText>

      <FormGroupWithHelpText
        label={t('CA certificate')}
        labelIcon={
          <Popover
            headerContent={t('CA certificate')}
            bodyContent={cacertHelperTextPopover}
            alertSeverityVariant="info"
          >
            <button
              type="button"
              onClick={onClickEventPreventDef}
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
          onDataChange={(_e, value) => {
            onDataChange(value);
          }}
          onTextChange={(_e, value) => {
            onTextChange(value);
          }}
          onClearClick={() => {
            handleChange('cacert', '');
          }}
          browseButtonText="Upload"
          url={url}
          isDisabled={insecureSkipVerify === 'true'}
        />
      </FormGroupWithHelpText>
    </Form>
  );
};

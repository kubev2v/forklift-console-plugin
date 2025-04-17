import { type FC, type FormEvent, type MouseEvent, useCallback, useReducer } from 'react';
import { Base64 } from 'js-base64';
import { FormGroupWithHelpText } from 'src/components/common/FormGroupWithHelpText/FormGroupWithHelpText';
import { CertificateUpload } from 'src/modules/Providers/utils/components/CertificateUpload/CertificateUpload';
import { safeBase64Decode } from 'src/modules/Providers/utils/helpers/safeBase64Decode';
import { openstackSecretFieldValidator } from 'src/modules/Providers/utils/validators/provider/openstack/openstackSecretFieldValidator';
import { ForkliftTrans, useForkliftTranslation } from 'src/utils/i18n';

import { Divider, Form, Popover, Radio, Switch } from '@patternfly/react-core';
import HelpIcon from '@patternfly/react-icons/dist/esm/icons/help-icon';

import type { EditComponentProps } from '../BaseCredentialsSection';

import { ApplicationCredentialNameSecretFieldsFormGroup } from './OpenstackCredentialsEditFormGroups/ApplicationCredentialNameSecretFieldsFormGroup';
import { ApplicationWithCredentialsIDFormGroup } from './OpenstackCredentialsEditFormGroups/ApplicationWithCredentialsIDFormGroup';
import { PasswordSecretFieldsFormGroup } from './OpenstackCredentialsEditFormGroups/PasswordSecretFieldsFormGroup';
import { TokenWithUserIDSecretFieldsFormGroup } from './OpenstackCredentialsEditFormGroups/TokenWithUserIDSecretFieldsFormGroup';
import { TokenWithUsernameSecretFieldsFormGroup } from './OpenstackCredentialsEditFormGroups/TokenWithUsernameSecretFieldsFormGroup';

export const OpenstackCredentialsEdit: FC<EditComponentProps> = ({ onChange, secret }) => {
  const { t } = useForkliftTranslation();

  const insecureSkipVerifyHelperTextMsgs = {
    error: t('Error: this field must be set to a boolean value.'),
    successAndNotSkipped: t("The provider's CA certificate will be validated."),
    successAndSkipped: t("The provider's CA certificate won't be validated."),
  };

  const insecureSkipVerifyHelperTextPopover = (
    <ForkliftTrans>
      Note: If <strong>Skip certificate validation</strong> is selected, migrations from this
      provider will not be secure, meaning that the transferred data is sent over an insecure
      connection and potentially sensitive data could be exposed.
    </ForkliftTrans>
  );

  const url = safeBase64Decode(secret?.data?.url);
  const authType = safeBase64Decode(secret?.data?.authType);
  const username = safeBase64Decode(secret?.data?.username);
  const insecureSkipVerify = safeBase64Decode(secret?.data?.insecureSkipVerify);
  const cacert = safeBase64Decode(secret?.data?.cacert);

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
    authenticationType,
    validation: {
      cacert: openstackSecretFieldValidator('cacert', cacert),
      insecureSkipVerify: openstackSecretFieldValidator('insecureSkipVerify', insecureSkipVerify),
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
      dispatch({ payload: { field: id, validationState }, type: 'SET_FIELD_VALIDATED' });

      // don't trim fields that allow spaces
      const encodedValue = ['cacert'].includes(id)
        ? Base64.encode(value || '')
        : Base64.encode(value?.trim() || '');

      onChange({ ...secret, data: { ...secret.data, [id]: encodedValue } });
    },
    [secret],
  );

  const handleAuthTypeChange = useCallback(
    (type: string) => {
      dispatch({ payload: type, type: 'SET_AUTHENTICATION_TYPE' });

      switch (type) {
        case 'passwordSecretFields':
          onChange({
            ...secret,
            data: { ...secret.data, authType: Base64.encode('password') },
          });
          break;
        case 'tokenWithUserIDSecretFields':
        case 'tokenWithUsernameSecretFields':
          // on change also clean userID and username
          onChange({
            ...secret,
            data: {
              ...secret.data,
              authType: Base64.encode('token'),
              userID: undefined,
              username: undefined,
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
              applicationCredentialID: undefined,
              authType: Base64.encode('applicationcredential'),
              username: undefined,
            },
          });
          break;
        default:
          break;
      }
    },
    [secret],
  );

  const onClick: (event: MouseEvent<HTMLButtonElement>) => void = (event) => {
    event.preventDefault();
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
          onChange={() => {
            handleAuthTypeChange('applicationCredentialIdSecretFields');
          }}
        />
        <Radio
          name="authType"
          label="Application credential name"
          id="applicationCredentialNameSecretFields"
          isChecked={state.authenticationType === 'applicationCredentialNameSecretFields'}
          onChange={() => {
            handleAuthTypeChange('applicationCredentialNameSecretFields');
          }}
        />
        <Radio
          name="authType"
          label="Token with user ID"
          id="tokenWithUserIDSecretFields"
          isChecked={state.authenticationType === 'tokenWithUserIDSecretFields'}
          onChange={() => {
            handleAuthTypeChange('tokenWithUserIDSecretFields');
          }}
        />
        <Radio
          name="authType"
          label="Token with user name"
          id="tokenWithUsernameSecretFields"
          isChecked={state.authenticationType === 'tokenWithUsernameSecretFields'}
          onChange={() => {
            handleAuthTypeChange('tokenWithUsernameSecretFields');
          }}
        />
        <Radio
          name="authType"
          label="Password"
          id="passwordSecretFields"
          isChecked={state.authenticationType === 'passwordSecretFields'}
          onChange={() => {
            handleAuthTypeChange('passwordSecretFields');
          }}
        />
      </FormGroupWithHelpText>

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

      <FormGroupWithHelpText
        label={t('Skip certificate validation')}
        labelIcon={
          <Popover
            headerContent={<div>Skip certificate validation</div>}
            bodyContent={<div>{insecureSkipVerifyHelperTextPopover}</div>}
            alertSeverityVariant="info"
          >
            <button type="button" onClick={onClick} className="pf-c-form__group-label-help">
              <HelpIcon />
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
          isChecked={insecureSkipVerify === 'true'}
          hasCheckIcon
          onChange={(e, value) => {
            onChangeInsecure(value, e);
          }}
        />
      </FormGroupWithHelpText>
      <FormGroupWithHelpText
        label={
          insecureSkipVerify === 'true'
            ? t("CA certificate - disabled when 'Skip certificate validation' is selected")
            : t('CA certificate - leave empty to use system CA certificates')
        }
        fieldId="cacert"
        helperText={state.validation.cacert.msg}
        validated={state.validation.cacert.type}
        helperTextInvalid={state.validation.cacert.msg}
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

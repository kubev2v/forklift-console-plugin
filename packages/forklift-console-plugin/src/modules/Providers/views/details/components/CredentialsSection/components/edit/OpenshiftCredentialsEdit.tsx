import React, { useCallback, useReducer } from 'react';
import { Trans } from 'react-i18next';
import { Base64 } from 'js-base64';
import {
  openshiftSecretFieldValidator,
  safeBase64Decode,
  Validation,
} from 'src/modules/Providers/utils';
import { useForkliftTranslation } from 'src/utils/i18n';

import { Button, Form, FormGroup, TextInput } from '@patternfly/react-core';
import EyeIcon from '@patternfly/react-icons/dist/esm/icons/eye-icon';
import EyeSlashIcon from '@patternfly/react-icons/dist/esm/icons/eye-slash-icon';

import { EditComponentProps } from '../BaseCredentialsSection';

export const OpenshiftCredentialsEdit: React.FC<EditComponentProps> = ({ secret, onChange }) => {
  const { t } = useForkliftTranslation();

  const token = safeBase64Decode(secret?.data?.token || '');

  const tokenHelperTextMsgs = {
    error: (
      <div className="forklift-page-provider-field-error-validation">
        <Trans t={t} ns="plugin__forklift-console-plugin">
          {
            'Error: The format of the provided token is invalid. Ensure the token is a valid Kubernetes service account token.'
          }
        </Trans>
      </div>
    ),
    success: (
      <div className="forklift-page-provider-field-success-validation">
        <Trans t={t} ns="plugin__forklift-console-plugin">
          {
            'A service account token with cluster admin privileges, required for authenticating the connection to the API server.'
          }
        </Trans>
      </div>
    ),
    default: (
      <div className="forklift-page-provider-field-default-validation">
        <Trans t={t} ns="plugin__forklift-console-plugin">
          {
            'A service account token with cluster admin privileges, required for authenticating the connection to the API server.'
          }
        </Trans>
      </div>
    ),
  };

  const initialState = {
    passwordHidden: true,
    validation: {
      token: 'default' as Validation,
      tokenHelperText: tokenHelperTextMsgs.default,
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
    </Form>
  );
};

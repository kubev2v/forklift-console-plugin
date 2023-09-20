import React, { useCallback, useReducer } from 'react';
import { Base64 } from 'js-base64';
import {
  openstackSecretFieldValidator,
  safeBase64Decode,
  Validation,
} from 'src/modules/Providers/utils';
import { useForkliftTranslation } from 'src/utils/i18n';

import { Button, FormGroup, TextInput } from '@patternfly/react-core';
import EyeIcon from '@patternfly/react-icons/dist/esm/icons/eye-icon';
import EyeSlashIcon from '@patternfly/react-icons/dist/esm/icons/eye-slash-icon';

import { EditComponentProps } from '../../BaseCredentialsSection';

export const TokenWithUserIDSecretFieldsFormGroup: React.FC<EditComponentProps> = ({
  secret,
  onChange,
}) => {
  const { t } = useForkliftTranslation();

  const token = safeBase64Decode(secret?.data?.token || '');
  const userID = safeBase64Decode(secret?.data?.userID || '');
  const projectID = safeBase64Decode(secret?.data?.projectID || '');
  const regionName = safeBase64Decode(secret?.data?.regionName || '');

  const initialState = {
    passwordHidden: true,
    validation: {
      token: 'default' as Validation,
      userID: 'default' as Validation,
      projectID: 'default' as Validation,
      regionName: 'default' as Validation,
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
      const validationState = openstackSecretFieldValidator(id, value);
      dispatch({ type: 'SET_FIELD_VALIDATED', payload: { field: id, validationState } });

      const encodedValue = Base64.encode(value.trim());
      onChange({ ...secret, data: { ...secret.data, [id]: encodedValue } });
    },
    [secret, onChange],
  );

  const togglePasswordHidden = () => {
    dispatch({ type: 'TOGGLE_PASSWORD_HIDDEN' });
  };

  return (
    <>
      <FormGroup
        label={t('Token')}
        isRequired
        fieldId="token"
        helperText={t('OpenStack REST API token credentials.')}
        helperTextInvalid={t('Invalid token.')}
        validated={state.validation.token}
      >
        <TextInput
          className="pf-u-w-75"
          isRequired
          type={state.passwordHidden ? 'password' : 'text'}
          id="token"
          name="token"
          value={token}
          onChange={(value) => handleChange('token', value)}
          validated={state.validation.token}
        />
        <Button
          variant="control"
          onClick={togglePasswordHidden}
          aria-label={state.passwordHidden ? 'Show password' : 'Hide password'}
        >
          {state.passwordHidden ? <EyeIcon /> : <EyeSlashIcon />}
        </Button>
      </FormGroup>

      <FormGroup
        label={t('User ID')}
        isRequired
        fieldId="userID"
        helperText={t('OpenStack REST API user ID.')}
        helperTextInvalid={t('Invalid User ID.')}
        validated={state.validation.userID}
      >
        <TextInput
          isRequired
          type="text"
          id="userID"
          name="userID"
          value={userID}
          onChange={(value) => handleChange('userID', value)}
          validated={state.validation.userID}
        />
      </FormGroup>

      <FormGroup
        label={t('Project ID')}
        isRequired
        fieldId="projectID"
        helperText={t('OpenStack project ID for token credentials.')}
        helperTextInvalid={t('Invalid Project ID.')}
        validated={state.validation.projectID}
      >
        <TextInput
          isRequired
          type="text"
          id="projectID"
          name="projectID"
          value={projectID}
          onChange={(value) => handleChange('projectID', value)}
          validated={state.validation.projectID}
        />
      </FormGroup>

      <FormGroup
        label={t('Region')}
        isRequired
        fieldId="regionName"
        helperText={t('OpenStack region.')}
        helperTextInvalid={t('Invalid region name.')}
        validated={state.validation.regionName}
      >
        <TextInput
          isRequired
          type="text"
          id="regionName"
          name="regionName"
          value={regionName}
          onChange={(value) => handleChange('regionName', value)}
          validated={state.validation.regionName}
        />
      </FormGroup>
    </>
  );
};

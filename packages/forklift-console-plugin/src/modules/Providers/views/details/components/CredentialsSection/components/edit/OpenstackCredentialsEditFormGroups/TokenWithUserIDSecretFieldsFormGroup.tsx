import React, { useCallback, useReducer } from 'react';
import { Base64 } from 'js-base64';
import { openstackSecretFieldValidator, safeBase64Decode } from 'src/modules/Providers/utils';
import { useForkliftTranslation } from 'src/utils/i18n';

import { FormGroupWithHelpText } from '@kubev2v/common';
import { Button, TextInput } from '@patternfly/react-core';
import EyeIcon from '@patternfly/react-icons/dist/esm/icons/eye-icon';
import EyeSlashIcon from '@patternfly/react-icons/dist/esm/icons/eye-slash-icon';

import { EditComponentProps } from '../../BaseCredentialsSection';

export const TokenWithUserIDSecretFieldsFormGroup: React.FC<EditComponentProps> = ({
  secret,
  onChange,
}) => {
  const { t } = useForkliftTranslation();

  const token = safeBase64Decode(secret?.data?.token);
  const userID = safeBase64Decode(secret?.data?.userID);
  const projectID = safeBase64Decode(secret?.data?.projectID);
  const regionName = safeBase64Decode(secret?.data?.regionName);

  const initialState = {
    passwordHidden: true,
    validation: {
      token: openstackSecretFieldValidator('token', token),
      userID: openstackSecretFieldValidator('userID', userID),
      projectID: openstackSecretFieldValidator('projectID', projectID),
      regionName: openstackSecretFieldValidator('regionName', regionName),
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

      const encodedValue = Base64.encode(value?.trim() || '');
      onChange({ ...secret, data: { ...secret.data, [id]: encodedValue } });
    },
    [secret, onChange],
  );

  const togglePasswordHidden = () => {
    dispatch({ type: 'TOGGLE_PASSWORD_HIDDEN' });
  };

  return (
    <>
      <FormGroupWithHelpText
        label={t('Token')}
        isRequired
        fieldId="token"
        helperText={state.validation.token.msg}
        helperTextInvalid={state.validation.token.msg}
        validated={state.validation.token.type}
      >
        <TextInput
          spellCheck="false"
          className="pf-u-w-75"
          isRequired
          type={state.passwordHidden ? 'password' : 'text'}
          id="token"
          name="token"
          value={token}
          onChange={(value) => handleChange('token', value)}
          validated={state.validation.token.type}
        />
        <Button
          variant="control"
          onClick={togglePasswordHidden}
          aria-label={state.passwordHidden ? 'Show password' : 'Hide password'}
        >
          {state.passwordHidden ? <EyeIcon /> : <EyeSlashIcon />}
        </Button>
      </FormGroupWithHelpText>

      <FormGroupWithHelpText
        label={t('User ID')}
        isRequired
        fieldId="userID"
        helperText={state.validation.userID.msg}
        helperTextInvalid={state.validation.userID.msg}
        validated={state.validation.userID.type}
      >
        <TextInput
          spellCheck="false"
          isRequired
          type="text"
          id="userID"
          name="userID"
          value={userID}
          onChange={(value) => handleChange('userID', value)}
          validated={state.validation.userID.type}
        />
      </FormGroupWithHelpText>

      <FormGroupWithHelpText
        label={t('Project ID')}
        isRequired
        fieldId="projectID"
        helperText={state.validation.projectID.msg}
        helperTextInvalid={state.validation.projectID.msg}
        validated={state.validation.projectID.type}
      >
        <TextInput
          spellCheck="false"
          isRequired
          type="text"
          id="projectID"
          name="projectID"
          value={projectID}
          onChange={(value) => handleChange('projectID', value)}
          validated={state.validation.projectID.type}
        />
      </FormGroupWithHelpText>

      <FormGroupWithHelpText
        label={t('Region')}
        isRequired
        fieldId="regionName"
        helperText={state.validation.regionName.msg}
        helperTextInvalid={state.validation.regionName.msg}
        validated={state.validation.regionName.type}
      >
        <TextInput
          spellCheck="false"
          isRequired
          type="text"
          id="regionName"
          name="regionName"
          value={regionName}
          onChange={(value) => handleChange('regionName', value)}
          validated={state.validation.regionName.type}
        />
      </FormGroupWithHelpText>
    </>
  );
};

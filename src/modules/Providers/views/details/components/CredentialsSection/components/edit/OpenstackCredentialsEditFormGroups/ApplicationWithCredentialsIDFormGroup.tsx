import { type FC, type FormEvent, useCallback, useReducer } from 'react';
import { Base64 } from 'js-base64';
import { FormGroupWithHelpText } from 'src/components/common/FormGroupWithHelpText/FormGroupWithHelpText';
import { safeBase64Decode } from 'src/modules/Providers/utils/helpers/safeBase64Decode';
import { openstackSecretFieldValidator } from 'src/modules/Providers/utils/validators/provider/openstack/openstackSecretFieldValidator';
import { useForkliftTranslation } from 'src/utils/i18n';

import { Button, InputGroup, TextInput } from '@patternfly/react-core';
import EyeIcon from '@patternfly/react-icons/dist/esm/icons/eye-icon';
import EyeSlashIcon from '@patternfly/react-icons/dist/esm/icons/eye-slash-icon';

import type { EditComponentProps } from '../../BaseCredentialsSection';

import { OpenstackSecretFieldId } from './constants';

export const ApplicationWithCredentialsIDFormGroup: FC<EditComponentProps> = ({
  onChange,
  secret,
}) => {
  const { t } = useForkliftTranslation();

  const applicationCredentialID = safeBase64Decode(secret?.data?.applicationCredentialID);
  const applicationCredentialSecret = safeBase64Decode(secret?.data?.applicationCredentialSecret);
  const regionName = safeBase64Decode(secret?.data?.regionName);
  const projectName = safeBase64Decode(secret?.data?.projectName);

  const initialState = {
    passwordHidden: true,
    validation: {
      applicationCredentialID: openstackSecretFieldValidator(
        OpenstackSecretFieldId.ApplicationCredentialId,
        applicationCredentialID,
      ),
      applicationCredentialSecret: openstackSecretFieldValidator(
        OpenstackSecretFieldId.ApplicationCredentialSecret,
        applicationCredentialSecret,
      ),
      projectName: openstackSecretFieldValidator(OpenstackSecretFieldId.ProjectName, projectName),
      regionName: openstackSecretFieldValidator(OpenstackSecretFieldId.RegionName, regionName),
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
      const validationState = openstackSecretFieldValidator(id, value);
      dispatch({ payload: { field: id, validationState }, type: 'SET_FIELD_VALIDATED' });

      const encodedValue = Base64.encode(value?.trim() || '');
      onChange({ ...secret, data: { ...secret.data, [id]: encodedValue } });
    },
    [secret, onChange],
  );

  const togglePasswordHidden = () => {
    dispatch({ type: 'TOGGLE_PASSWORD_HIDDEN' });
  };

  type onChangeFactoryType = (
    changedField: string,
  ) => (value: string, event: FormEvent<HTMLInputElement>) => void;

  const onChangeFactory: onChangeFactoryType = (changedField) => (value) => {
    handleChange(changedField, value);
  };

  return (
    <>
      <FormGroupWithHelpText
        label={t('Application credential ID')}
        isRequired
        fieldId={OpenstackSecretFieldId.ApplicationCredentialId}
        helperText={state.validation.applicationCredentialID.msg}
        helperTextInvalid={state.validation.applicationCredentialID.msg}
        validated={state.validation.applicationCredentialID.type}
      >
        <TextInput
          spellCheck="false"
          isRequired
          type="text"
          id={OpenstackSecretFieldId.ApplicationCredentialId}
          name={OpenstackSecretFieldId.ApplicationCredentialId}
          value={applicationCredentialID}
          onChange={(e, value) => {
            onChangeFactory(OpenstackSecretFieldId.ApplicationCredentialId)(value, e);
          }}
          validated={state.validation.applicationCredentialID.type}
        />
      </FormGroupWithHelpText>

      <FormGroupWithHelpText
        label={t('Application credential Secret')}
        isRequired
        fieldId={OpenstackSecretFieldId.ApplicationCredentialSecret}
        helperText={state.validation.applicationCredentialSecret.msg}
        helperTextInvalid={state.validation.applicationCredentialSecret.msg}
        validated={state.validation.applicationCredentialSecret.type}
      >
        <InputGroup>
          <TextInput
            spellCheck="false"
            className="pf-u-w-75"
            isRequired
            type={state.passwordHidden ? 'password' : 'text'}
            id={OpenstackSecretFieldId.ApplicationCredentialSecret}
            name={OpenstackSecretFieldId.ApplicationCredentialSecret}
            value={applicationCredentialSecret}
            onChange={(e, value) => {
              onChangeFactory(OpenstackSecretFieldId.ApplicationCredentialSecret)(value, e);
            }}
            validated={state.validation.applicationCredentialSecret.type}
          />
          <Button
            variant="control"
            onClick={togglePasswordHidden}
            aria-label={state.passwordHidden ? 'Show password' : 'Hide password'}
          >
            {state.passwordHidden ? <EyeIcon /> : <EyeSlashIcon />}
          </Button>
        </InputGroup>
      </FormGroupWithHelpText>

      <FormGroupWithHelpText
        label={t('Region')}
        isRequired
        fieldId={OpenstackSecretFieldId.RegionName}
        helperText={state.validation.regionName.msg}
        helperTextInvalid={state.validation.regionName.msg}
        validated={state.validation.regionName.type}
      >
        <TextInput
          spellCheck="false"
          isRequired
          type="text"
          id={OpenstackSecretFieldId.RegionName}
          name={OpenstackSecretFieldId.RegionName}
          value={regionName}
          onChange={(e, value) => {
            onChangeFactory(OpenstackSecretFieldId.RegionName)(value, e);
          }}
          validated={state.validation.regionName.type}
        />
      </FormGroupWithHelpText>

      <FormGroupWithHelpText
        label={t('Project')}
        isRequired
        fieldId={OpenstackSecretFieldId.ProjectName}
        helperText={state.validation.projectName.msg}
        helperTextInvalid={state.validation.projectName.msg}
        validated={state.validation.projectName.type}
      >
        <TextInput
          spellCheck="false"
          isRequired
          type="text"
          id={OpenstackSecretFieldId.ProjectName}
          name={OpenstackSecretFieldId.ProjectName}
          value={projectName}
          onChange={(e, value) => {
            onChangeFactory(OpenstackSecretFieldId.ProjectName)(value, e);
          }}
          validated={state.validation.projectName.type}
        />
      </FormGroupWithHelpText>
    </>
  );
};

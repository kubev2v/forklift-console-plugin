import React, { useCallback, useReducer } from 'react';
import { validateNFSMount, Validation } from 'src/modules/Providers/utils';
import { ForkliftTrans, useForkliftTranslation } from 'src/utils/i18n';

import { V1beta1Provider } from '@kubev2v/types';
import { Form, FormGroup, TextInput } from '@patternfly/react-core';

export interface OVAProviderCreateFormProps {
  provider: V1beta1Provider;
  onChange: (newValue: V1beta1Provider) => void;
}

export const OVAProviderCreateForm: React.FC<OVAProviderCreateFormProps> = ({
  provider,
  onChange,
}) => {
  const { t } = useForkliftTranslation();

  const url = provider?.spec?.url || '';

  const helperTextMsgs = {
    error: (
      <div className="forklift--create-provider-field-error-validation">
        <ForkliftTrans>
          Error: The format of the provided URL is invalid. Ensure the URL is in the following
          format: <strong>ip_or_hostname_of_nfs_server:/nfs_path</strong>. For example:{' '}
          <strong>10.10.0.10:/ova</strong>.
        </ForkliftTrans>
      </div>
    ),
    success: (
      <div className="forklift--create-provider-field-success-validation">
        <ForkliftTrans>
          URL of the NFS file share that serves the OVA. Ensure the URL is in the following format:{' '}
          <strong>ip_or_hostname_of_nfs_server:/nfs_path</strong>. For example:{' '}
          <strong>10.10.0.10:/ova</strong> .
        </ForkliftTrans>
      </div>
    ),
    default: (
      <div className="forklift--create-provider-field-default-validation">
        <ForkliftTrans>
          URL of the NFS file share that serves the OVA. Ensure the URL is in the following format:{' '}
          <strong>ip_or_hostname_of_nfs_server:/nfs_path</strong>. For example:{' '}
          <strong>10.10.0.10:/ova</strong> .
        </ForkliftTrans>
      </div>
    ),
  };

  const initialState = {
    validation: {
      url: 'default' as Validation,
      urlHelperText: helperTextMsgs.default,
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
      default:
        return state;
    }
  };

  const [state, dispatch] = useReducer(reducer, initialState);

  const handleChange = useCallback(
    (id, value) => {
      const trimmedValue = value.trim();

      if (id === 'url') {
        const validationState = validateNFSMount(trimmedValue) ? 'success' : 'error';

        dispatch({ type: 'SET_FIELD_VALIDATED', payload: { field: id, validationState } });

        dispatch({
          type: 'SET_FIELD_VALIDATED',
          payload: {
            field: 'urlHelperText',
            validationState: helperTextMsgs[validationState],
          },
        });

        onChange({ ...provider, spec: { ...provider.spec, url: trimmedValue } });
      }
    },
    [provider],
  );

  return (
    <Form isWidthLimited className="forklift-section-provider-edit">
      <FormGroup
        label={t('URL')}
        fieldId="url"
        validated={state.validation.url}
        helperText={state.validation.urlHelperText}
        helperTextInvalid={state.validation.urlHelperText}
      >
        <TextInput
          type="text"
          id="url"
          name="url"
          value={url}
          validated={state.validation.url}
          onChange={(value) => handleChange('url', value)}
        />
      </FormGroup>
    </Form>
  );
};

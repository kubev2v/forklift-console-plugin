import React, { useCallback, useReducer } from 'react';
import { validateURL, Validation } from 'src/modules/Providers/utils';
import { useForkliftTranslation } from 'src/utils/i18n';

import { V1beta1Provider } from '@kubev2v/types';
import { Form, FormGroup, TextInput } from '@patternfly/react-core';

export interface OvirtProviderCreateFormProps {
  provider: V1beta1Provider;
  onChange: (newValue: V1beta1Provider) => void;
}

export const OvirtProviderCreateForm: React.FC<OvirtProviderCreateFormProps> = ({
  provider,
  onChange,
}) => {
  const { t } = useForkliftTranslation();

  const url = provider?.spec?.url || '';

  const helperTextInvalid = {
    error: t(
      'Error: Please provide a valid URL with a schema, domain, and path. For example: https://rhv.com/ovirt-engine/api.',
    ),
    warning: t(
      'Warning: The provided URL does not end with "ovirt-engine/api". Ensure it includes the correct path, like: https://rhv.com/ovirt-engine/api.',
    ),
  };

  const initialState = {
    validation: {
      url: 'default' as Validation,
      urlHelperTextInvalid: '',
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
      if (id !== 'url') return;

      const trimmedValue: string = value.trim();
      const validationState = getURLValidationState(trimmedValue);

      dispatch({
        type: 'SET_FIELD_VALIDATED',
        payload: { field: 'url', validationState },
      });

      dispatch({
        type: 'SET_FIELD_VALIDATED',
        payload: {
          field: 'urlHelperTextInvalid',
          validationState: helperTextInvalid[validationState],
        },
      });

      onChange({ ...provider, spec: { ...provider.spec, url: trimmedValue } });
    },
    [provider],
  );

  const getURLValidationState = (url: string): Validation => {
    if (!validateURL(url)) return 'error';
    if (!url.endsWith('ovirt-engine/api')) return 'warning';
    return 'success';
  };

  return (
    <Form isWidthLimited className="forklift-section-provider-edit">
      <FormGroup
        label={t('URL')}
        isRequired
        fieldId="url"
        helperText={t(
          'Enter the API engine URL for the Red Hat Virtualization (RHV) provider. Ensure it includes the "ovirt-engine/api" path, e.g., https://rhv.com/ovirt-engine/api.',
        )}
        validated={state.validation.url}
        helperTextInvalid={state.validation.urlHelperTextInvalid}
      >
        <TextInput
          isRequired
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

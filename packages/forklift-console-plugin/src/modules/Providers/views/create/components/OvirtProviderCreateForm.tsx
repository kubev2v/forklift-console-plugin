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

  const helperTextMsgs = {
    error: t(
      'Error: The format of the provided URL is invalid. Ensure the URL includes a scheme, a domain name, and a path. For example: https://rhv-host-example.com/ovirt-engine/api',
    ),
    warning: t(
      'Warning: The provided URL does not end with the RHVM API endpoint path: "/ovirt-engine/api". Ensure the URL includes the correct path. For example: https://rhv-host-example.com/ovirt-engine/api',
    ),
    success: t(
      'URL of the Red Hat Virtualization Manager (RHVM) API endpoint. Ensure the URL includes the "/ovirt-engine/api" path. For example: https://rhv-host-example.com/ovirt-engine/api',
    ),
  };

  const initialState = {
    validation: {
      url: 'default' as Validation,
      urlHelperText: helperTextMsgs.success,
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
          field: 'urlHelperText',
          validationState: helperTextMsgs[validationState],
        },
      });

      onChange({ ...provider, spec: { ...provider.spec, url: trimmedValue } });
    },
    [provider],
  );

  const getURLValidationState = (url: string): Validation => {
    if (!validateURL(url)) return 'error';
    if (!url.endsWith('ovirt-engine/api') && !url.endsWith('ovirt-engine/api/')) return 'warning';
    return 'success';
  };

  return (
    <Form isWidthLimited className="forklift-section-provider-edit">
      <FormGroup
        label={t('URL')}
        isRequired
        fieldId="url"
        validated={state.validation.url}
        helperText={state.validation.urlHelperText}
        helperTextInvalid={state.validation.urlHelperText}
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

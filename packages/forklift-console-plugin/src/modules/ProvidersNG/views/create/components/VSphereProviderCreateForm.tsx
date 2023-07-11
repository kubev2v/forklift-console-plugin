import React, { useCallback, useReducer } from 'react';
import { validateContainerImage, validateURL, Validation } from 'src/modules/ProvidersNG/utils';
import { useForkliftTranslation } from 'src/utils/i18n';

import { V1beta1Provider } from '@kubev2v/types';
import { Form, FormGroup, TextInput } from '@patternfly/react-core';

export interface VSphereProviderCreateFormProps {
  provider: V1beta1Provider;
  onChange: (newValue: V1beta1Provider) => void;
}

export const VSphereProviderCreateForm: React.FC<VSphereProviderCreateFormProps> = ({
  provider,
  onChange,
}) => {
  const { t } = useForkliftTranslation();

  const url = provider?.spec?.url || '';
  const vddkInitImage = provider?.spec?.settings?.['vddkInitImage'] || '';

  const initialState = {
    validation: {
      url: 'default' as Validation,
      vddkInitImage: 'default' as Validation,
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

      if (id == 'vddkInitImage') {
        const validationState =
          trimmedValue == '' || validateContainerImage(trimmedValue) ? 'success' : 'error';
        dispatch({ type: 'SET_FIELD_VALIDATED', payload: { field: id, validationState } });

        onChange({
          ...provider,
          spec: {
            type: provider.spec.type,
            url: provider.spec.url,
            ...provider?.spec,
            settings: {
              ...(provider?.spec?.settings as object),
              vddkInitImage: value.trim(),
            },
          },
        });
      }

      if (id === 'url') {
        const validationState = validateURL(trimmedValue) ? 'success' : 'error';
        dispatch({ type: 'SET_FIELD_VALIDATED', payload: { field: id, validationState } });

        onChange({ ...provider, spec: { ...provider.spec, url: trimmedValue } });
      }
    },
    [provider],
  );

  return (
    <Form isWidthLimited className="forklift-section-provider-edit">
      <FormGroup
        label={t('URL')}
        isRequired
        fieldId="url"
        helperText={t('URL of the provider')}
        validated={state.validation.url}
        helperTextInvalid={t('Error: URL is required and must be valid.')}
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

      <FormGroup
        label={t('VDDK Init Image')}
        fieldId="vddkInitImage"
        helperText={t(
          'VDDK container image of the provider, when left empty some functionality will not be available',
        )}
        validated={state.validation.vddkInitImage}
        helperTextInvalid={t('Error: VDDK Init Image must be valid.')}
      >
        <TextInput
          type="text"
          id="vddkInitImage"
          name="vddkInitImage"
          value={vddkInitImage}
          validated={state.validation.vddkInitImage}
          onChange={(value) => handleChange('vddkInitImage', value)}
        />
      </FormGroup>
    </Form>
  );
};

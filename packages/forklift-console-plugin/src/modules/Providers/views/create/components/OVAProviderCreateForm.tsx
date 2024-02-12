import React, { useCallback, useReducer } from 'react';
import { validateOvaNfsPath } from 'src/modules/Providers/utils';
import { useForkliftTranslation } from 'src/utils/i18n';

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

  const initialState = {
    validation: {
      url: {
        type: 'default',
        msg: 'The NFS shared directory containing the Open Virtual Appliance (OVA) files, for example: 10.10.0.10:/ova .',
      },
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
        const validationState = validateOvaNfsPath(trimmedValue);

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
        fieldId="url"
        isRequired
        validated={state.validation.url.type}
        helperText={state.validation.url.msg}
        helperTextInvalid={state.validation.url.msg}
      >
        <TextInput
          type="text"
          id="url"
          name="url"
          isRequired
          value={provider?.spec?.url || ''}
          validated={state.validation.url.type}
          onChange={(value) => handleChange('url', value)}
        />
      </FormGroup>
    </Form>
  );
};

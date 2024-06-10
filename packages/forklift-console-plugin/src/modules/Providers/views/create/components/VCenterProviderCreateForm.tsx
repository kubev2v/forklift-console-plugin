import React, { useCallback, useReducer } from 'react';
import { validateVCenterURL, validateVDDKImage, VDDKHelperText } from 'src/modules/Providers/utils';
import { useForkliftTranslation } from 'src/utils/i18n';

import { FormGroupWithHelpText } from '@kubev2v/common';
import { V1beta1Provider } from '@kubev2v/types';
import { Form, Popover, Radio, TextInput } from '@patternfly/react-core';
import HelpIcon from '@patternfly/react-icons/dist/esm/icons/help-icon';

export interface VCenterProviderCreateFormProps {
  provider: V1beta1Provider;
  onChange: (newValue: V1beta1Provider) => void;
}

export const VCenterProviderCreateForm: React.FC<VCenterProviderCreateFormProps> = ({
  provider,
  onChange,
}) => {
  const { t } = useForkliftTranslation();

  const url = provider?.spec?.url;
  const vddkInitImage = provider?.spec?.settings?.['vddkInitImage'];
  const sdkEndpoint = provider?.spec?.settings?.['sdkEndpoint'];

  const initialState = {
    validation: {
      url: validateVCenterURL(url),
      vddkInitImage: validateVDDKImage(vddkInitImage),
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
      const trimmedValue = value?.trim();

      if (id == 'vddkInitImage') {
        const validationState = validateVDDKImage(trimmedValue);

        dispatch({
          type: 'SET_FIELD_VALIDATED',
          payload: { field: 'vddkInitImage', validationState },
        });

        onChange({
          ...provider,
          spec: {
            ...provider?.spec,
            settings: {
              ...(provider?.spec?.settings as object),
              vddkInitImage: trimmedValue || undefined,
            },
          },
        });
      }

      if (id == 'sdkEndpoint') {
        const sdkEndpoint = trimmedValue || undefined;

        onChange({
          ...provider,
          spec: {
            ...provider?.spec,
            settings: {
              ...(provider?.spec?.settings as object),
              sdkEndpoint: sdkEndpoint,
            },
          },
        });
      }

      if (id === 'url') {
        // Validate URL - VCenter of ESXi
        const validationState = validateVCenterURL(trimmedValue);

        dispatch({ type: 'SET_FIELD_VALIDATED', payload: { field: 'url', validationState } });

        onChange({ ...provider, spec: { ...provider.spec, url: trimmedValue } });
      }
    },
    [provider],
  );

  return (
    <Form isWidthLimited className="forklift-section-provider-edit">
      <FormGroupWithHelpText
        role="radiogroup"
        fieldId="sdkEndpoint"
        label={t('Endpoint type')}
        helperText={t('Select vSphere provider endpoint type.')}
      >
        <Radio
          name="sdkEndpoint"
          label="vCenter"
          id="sdkEndpoint-vcenter"
          isChecked={!sdkEndpoint || sdkEndpoint === 'vcenter'}
          onChange={() => handleChange('sdkEndpoint', 'vcenter')}
        />
        <Radio
          name="sdkEndpoint"
          label="ESXi"
          id="sdkEndpoint-esxi"
          isChecked={sdkEndpoint === 'esxi'}
          onChange={() => handleChange('sdkEndpoint', 'esxi')}
        />
      </FormGroupWithHelpText>

      <FormGroupWithHelpText
        label={t('URL')}
        isRequired
        fieldId="url"
        helperText={state.validation.url.msg}
        helperTextInvalid={state.validation.url.msg}
        validated={state.validation.url.type}
      >
        <TextInput
          isRequired
          type="text"
          id="url"
          name="url"
          value={url}
          validated={state.validation.url.type}
          onChange={(value) => handleChange('url', value)}
        />
      </FormGroupWithHelpText>

      <FormGroupWithHelpText
        label={t('VDDK init image')}
        fieldId="vddkInitImage"
        helperText={state.validation.vddkInitImage.msg}
        helperTextInvalid={state.validation.vddkInitImage.msg}
        validated={state.validation.vddkInitImage.type}
        labelIcon={
          <Popover
            headerContent={t('VDDK init image')}
            bodyContent={VDDKHelperText}
            alertSeverityVariant="info"
          >
            <button
              type="button"
              onClick={(e) => e.preventDefault()}
              className="pf-c-form__group-label-help"
            >
              <HelpIcon />
            </button>
          </Popover>
        }
      >
        <TextInput
          type="text"
          id="vddkInitImage"
          name="vddkInitImage"
          value={vddkInitImage}
          validated={state.validation.vddkInitImage.type}
          onChange={(value) => handleChange('vddkInitImage', value)}
        />
      </FormGroupWithHelpText>
    </Form>
  );
};

import React, { useCallback, useReducer } from 'react';
import {
  validateVCenterURL,
  validateVDDKImage,
  VDDKHelperText,
  VDDKHelperTextShort,
} from 'src/modules/Providers/utils';
import { useForkliftTranslation } from 'src/utils/i18n';

import { FormGroupWithHelpText } from '@kubev2v/common';
import { V1beta1Provider } from '@kubev2v/types';
import { Checkbox, Form, Hint, HintBody, Popover, Radio, TextInput } from '@patternfly/react-core';
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
  const emptyVddkInitImage =
    provider?.metadata?.annotations?.['forklift.konveyor.io/empty-vddk-init-image'];
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

      if (id == 'emptyVddkInitImage') {
        const vddValidationState = validateVDDKImage(provider?.spec?.settings?.vddkInitImage);
        const initVddkValidationState = validateVDDKImage(undefined);
        const validationState =
          trimmedValue === 'yes' ? initVddkValidationState : vddValidationState;

        dispatch({
          type: 'SET_FIELD_VALIDATED',
          payload: { field: 'vddkInitImage', validationState },
        });

        onChange({
          ...provider,
          metadata: {
            ...provider?.metadata,
            annotations: {
              ...(provider?.metadata?.annotations as object),
              'forklift.konveyor.io/empty-vddk-init-image': trimmedValue || undefined,
            },
          },
        });
      }

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
              vddkInitImage: trimmedValue,
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

  const onClick: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void = (event) => {
    event.preventDefault();
  };

  const onChangeUrl: (value: string, event: React.FormEvent<HTMLInputElement>) => void = (
    value,
  ) => {
    handleChange('url', value);
  };

  const onChangEmptyVddk: (checked: boolean, event: React.FormEvent<HTMLInputElement>) => void = (
    checked,
  ) => {
    handleChange('emptyVddkInitImage', checked ? 'yes' : undefined);
  };

  const onChangeVddk: (value: string, event: React.FormEvent<HTMLInputElement>) => void = (
    value,
  ) => {
    handleChange('vddkInitImage', value);
  };

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
          spellCheck="false"
          isRequired
          type="text"
          id="url"
          name="url"
          value={url}
          validated={state.validation.url.type}
          onChange={(e, v) => onChangeUrl(v, e)}
        />
      </FormGroupWithHelpText>

      <FormGroupWithHelpText
        label={t('VDDK init image')}
        fieldId="vddkInitImage"
        helperText={state.validation.vddkInitImage.msg}
        helperTextInvalid={state.validation.vddkInitImage.msg}
        validated={emptyVddkInitImage === 'yes' ? 'default' : state.validation.vddkInitImage.type}
        labelIcon={
          <Popover
            headerContent={t('VDDK init image')}
            bodyContent={VDDKHelperText}
            alertSeverityVariant="info"
          >
            <button type="button" onClick={onClick} className="pf-c-form__group-label-help">
              <HelpIcon />
            </button>
          </Popover>
        }
      >
        <Hint>
          <HintBody>
            <VDDKHelperTextShort />
            <Checkbox
              className="forklift-section-provider-edit-vddk-checkbox"
              label={t(
                'Skip VMware Virtual Disk Development Kit (VDDK) SDK acceleration (migration might be slow).',
              )}
              isChecked={emptyVddkInitImage === 'yes'}
              onChange={(e, v) => onChangEmptyVddk(v, e)}
              id="emptyVddkInitImage"
              name="emptyVddkInitImage"
            />
          </HintBody>
        </Hint>
        <div className="forklift-section-provider-edit-vddk-input">
          <TextInput
            spellCheck="false"
            type="text"
            id="vddkInitImage"
            name="vddkInitImage"
            isDisabled={emptyVddkInitImage === 'yes'}
            value={emptyVddkInitImage === 'yes' ? '' : vddkInitImage}
            validated={
              emptyVddkInitImage === 'yes' ? 'default' : state.validation.vddkInitImage.type
            }
            onChange={(e, v) => onChangeVddk(v, e)}
          />
        </div>
      </FormGroupWithHelpText>
    </Form>
  );
};

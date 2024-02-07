import React, { useCallback, useReducer } from 'react';
import { Trans } from 'react-i18next';
import { validateContainerImage, validateURL, Validation } from 'src/modules/Providers/utils';
import { useForkliftTranslation } from 'src/utils/i18n';

import { V1beta1Provider } from '@kubev2v/types';
import { Form, FormGroup, Popover, TextInput } from '@patternfly/react-core';
import HelpIcon from '@patternfly/react-icons/dist/esm/icons/help-icon';

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

  const urlHelperTextMsgs = {
    error: (
      <div className="forklift--create-provider-field-error-validation">
        <Trans t={t} ns="plugin__forklift-console-plugin">
          Error: The format of the provided URL is invalid. Ensure the URL includes a scheme, a
          domain name, and a path. For example:{' '}
          <strong>https://vCenter-host-example.com/sdk</strong>.
        </Trans>
      </div>
    ),
    warning: (
      <div className="forklift--create-provider-field-warning-validation">
        <Trans t={t} ns="plugin__forklift-console-plugin">
          Warning: The provided URL does not end with the SDK endpoint path: <strong>/sdk</strong>.
          Ensure the URL includes the correct path. For example:{' '}
          <strong>https://vCenter-host-example.com/sdk</strong>.
        </Trans>
      </div>
    ),
    success: (
      <div className="forklift--create-provider-field-success-validation">
        <Trans t={t} ns="plugin__forklift-console-plugin">
          URL of the vCenter API endpoint. Ensure the URL includes the <strong>/sdk</strong> path.
          For example: <strong>https://vCenter-host-example.com/sdk</strong>.
        </Trans>
      </div>
    ),
    default: (
      <div className="forklift--create-provider-field-default-validation">
        <Trans t={t} ns="plugin__forklift-console-plugin">
          URL of the vCenter API endpoint. Ensure the URL includes the <strong>/sdk</strong> path.
          For example: <strong>https://vCenter-host-example.com/sdk</strong>.
        </Trans>
      </div>
    ),
  };

  const vddkHelperTextMsgs = {
    error: (
      <div className="forklift--create-provider-field-error-validation">
        <Trans t={t} ns="plugin__forklift-console-plugin">
          Error: The format of the provided VDDK init image is invalid. Ensure the path is a valid
          container image path. For example: <strong>quay.io/kubev2v/vddk:latest</strong>.
        </Trans>
      </div>
    ),
    success: (
      <div className="forklift--create-provider-field-success-validation">
        <Trans t={t} ns="plugin__forklift-console-plugin">
          Virtual Disk Development Kit (VDDK) container init image path. The path must be empty or a
          valid container image path. For example: <strong>quay.io/kubev2v/vddk:latest</strong>.
        </Trans>
      </div>
    ),
    default: (
      <div className="forklift--create-provider-field-default-validation">
        <Trans t={t} ns="plugin__forklift-console-plugin">
          Virtual Disk Development Kit (VDDK) container init image path. The path must be empty or a
          valid container image path. For example: <strong>quay.io/kubev2v/vddk:latest</strong>.
        </Trans>
      </div>
    ),
  };

  const vddkHelperTextPopover = (
    <Trans t={t} ns="plugin__forklift-console-plugin">
      A VDDK init image is optional, but it is strongly recommended to specify a VDDK init image to
      accelerate migrations.
    </Trans>
  );

  const initialState = {
    validation: {
      url: 'default' as Validation,
      urlHelperText: urlHelperTextMsgs.default,
      vddkInitImage: 'default' as Validation,
      vddkHelperText: vddkHelperTextMsgs.default,
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

        dispatch({
          type: 'SET_FIELD_VALIDATED',
          payload: {
            field: 'vddkHelperText',
            validationState: vddkHelperTextMsgs[validationState],
          },
        });

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
        const validationState = getURLValidationState(trimmedValue);

        dispatch({ type: 'SET_FIELD_VALIDATED', payload: { field: 'url', validationState } });

        dispatch({
          type: 'SET_FIELD_VALIDATED',
          payload: {
            field: 'urlHelperText',
            validationState: urlHelperTextMsgs[validationState],
          },
        });

        onChange({ ...provider, spec: { ...provider.spec, url: trimmedValue } });
      }
    },
    [provider],
  );

  const getURLValidationState = (url: string): Validation => {
    if (!validateURL(url)) return 'error';
    if (!url.endsWith('sdk') && !url.endsWith('sdk/')) return 'warning';
    return 'success';
  };

  return (
    <Form isWidthLimited className="forklift-section-provider-edit">
      <FormGroup
        label={t('URL')}
        isRequired
        fieldId="url"
        helperText={state.validation.urlHelperText}
        validated={state.validation.url}
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

      <FormGroup
        label={t('VDDK init image')}
        fieldId="vddkInitImage"
        helperText={state.validation.vddkHelperText}
        validated={state.validation.vddkInitImage}
        helperTextInvalid={state.validation.vddkHelperText}
        labelIcon={
          <Popover
            headerContent={<div>VDDK init image</div>}
            bodyContent={<div>{vddkHelperTextPopover}</div>}
            alertSeverityVariant="info"
          >
            <button
              type="button"
              onClick={(e) => e.preventDefault()}
              className="pf-c-form__group-label-help"
            >
              <HelpIcon noVerticalAlign />
            </button>
          </Popover>
        }
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

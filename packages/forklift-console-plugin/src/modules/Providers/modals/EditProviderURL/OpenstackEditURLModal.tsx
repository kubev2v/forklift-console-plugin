import React from 'react';
import { Trans } from 'react-i18next';
import { useForkliftTranslation } from 'src/utils/i18n';

import { ProviderModel } from '@kubev2v/types';
import { ModalVariant } from '@patternfly/react-core';

import { validateURL } from '../../utils';
import { EditModal, ValidationHookType } from '../EditModal';

import { patchProviderURL } from './utils/patchProviderURL';
import { EditProviderURLModalProps } from './EditProviderURLModal';

export const OpenstackEditURLModal: React.FC<EditProviderURLModalProps> = (props) => {
  const { t } = useForkliftTranslation();

  const helperTextMsgs = {
    error: (
      <div className="forklift-edit-modal-field-error-validation">
        <Trans t={t} ns="plugin__forklift-console-plugin">
          Error: The format of the provided URL is invalid. Ensure the URL includes a scheme, a
          domain name, and a path. For example:{' '}
          <strong>https://identity_service.com:5000/v3</strong>.
        </Trans>
      </div>
    ),
    warning: (
      <div className="forklift--edit-modal-field-warning-validation">
        <Trans t={t} ns="plugin__forklift-console-plugin">
          Warning: The provided URL does not end with the API endpoint path:
          <strong>
            {'"'}/v3{'"'}
          </strong>
          {'. '}
          Ensure the URL includes the correct path. For example:{' '}
          <strong>https://identity_service.com:5000/v3</strong>.
        </Trans>
      </div>
    ),
    success: (
      <div className="forklift-edit-modal-field-success-validation">
        <Trans t={t} ns="plugin__forklift-console-plugin">
          For example: <strong>https://identity_service.com:5000/v3</strong>.
        </Trans>
      </div>
    ),
    default: (
      <div className="forklift-edit-modal-field-default-validation">
        <Trans t={t} ns="plugin__forklift-console-plugin">
          For example: <strong>https://identity_service.com:5000/v3</strong>.
        </Trans>
      </div>
    ),
  };

  const urlValidationHook: ValidationHookType = (value) => {
    const trimmedUrl: string = value.toString().trim();
    const isValidURL = validateURL(trimmedUrl);
    // error
    if (!isValidURL)
      return {
        validationHelpText: helperTextMsgs.error,
        validated: 'error',
      };
    // warning
    if (!trimmedUrl.endsWith('v3') && !trimmedUrl.endsWith('v3/'))
      return {
        validationHelpText: helperTextMsgs.warning,
        validated: 'warning',
      };
    // success
    return {
      validationHelpText: helperTextMsgs.success,
      validated: 'success',
    };
  };

  return (
    <EditModal
      {...props}
      jsonPath={'spec.url'}
      title={props?.title || t('Edit URL')}
      label={props?.label || t('URL')}
      model={ProviderModel}
      variant={ModalVariant.large}
      body={t('URL of the OpenStack Identity (Keystone) endpoint.')}
      helperText={helperTextMsgs.default}
      onConfirmHook={patchProviderURL}
      validationHook={urlValidationHook}
    />
  );
};

import React from 'react';
import { ForkliftTrans, useForkliftTranslation } from 'src/utils/i18n';

import { ProviderModel } from '@kubev2v/types';
import { ModalVariant } from '@patternfly/react-core';

import { validateURL } from '../../utils';
import { EditModal, ValidationHookType } from '../EditModal';

import { patchProviderURL } from './utils/patchProviderURL';
import { EditProviderURLModalProps } from './EditProviderURLModal';

export const VSphereEditURLModal: React.FC<EditProviderURLModalProps> = (props) => {
  const { t } = useForkliftTranslation();

  const helperTextMsgs = {
    error: (
      <div className="forklift-edit-modal-field-error-validation">
        <ForkliftTrans>
          Error: The format of the provided URL is invalid. Ensure the URL includes a scheme, a
          domain name, and a path. For example:{' '}
          <strong>https://vCenter-host-example.com/sdk</strong>.
        </ForkliftTrans>
      </div>
    ),
    warning: (
      <div className="forklift--edit-modal-field-warning-validation">
        <ForkliftTrans>
          Warning: The provided URL does not end with the SDK endpoint path: <strong>/sdk</strong>.
          Ensure the URL includes the correct path. For example:{' '}
          <strong>https://vCenter-host-example.com/sdk</strong>.
        </ForkliftTrans>
      </div>
    ),
    success: (
      <div className="forklift-edit-modal-field-success-validation">
        <ForkliftTrans>
          Ensure the URL includes the <strong>/sdk</strong> path. For example:{' '}
          <strong>https://vCenter-host-example.com/sdk</strong>.
        </ForkliftTrans>
      </div>
    ),
    default: (
      <div className="forklift-edit-modal-field-default-validation">
        <ForkliftTrans>
          Ensure the URL includes the <strong>/sdk</strong> path. For example:{' '}
          <strong>https://vCenter-host-example.com/sdk</strong>.
        </ForkliftTrans>
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
    if (!trimmedUrl.endsWith('sdk') && !trimmedUrl.endsWith('sdk/'))
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
      body={t('URL of the vCenter API endpoint.')}
      helperText={helperTextMsgs.default}
      onConfirmHook={patchProviderURL}
      validationHook={urlValidationHook}
    />
  );
};

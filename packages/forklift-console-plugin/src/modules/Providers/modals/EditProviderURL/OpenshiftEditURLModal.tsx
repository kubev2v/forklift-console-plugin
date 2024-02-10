import React from 'react';
import { ForkliftTrans, useForkliftTranslation } from 'src/utils/i18n';

import { ProviderModel } from '@kubev2v/types';
import { ModalVariant } from '@patternfly/react-core';

import { validateURL } from '../../utils';
import { EditModal, ValidationHookType } from '../EditModal';

import { patchProviderURL } from './utils/patchProviderURL';
import { EditProviderURLModalProps } from './EditProviderURLModal';

export const OpenshiftEditURLModal: React.FC<EditProviderURLModalProps> = (props) => {
  const { t } = useForkliftTranslation();

  const helperTextMsgs = {
    error: (
      <div className="forklift-edit-modal-field-error-validation">
        <ForkliftTrans>
          Error: The format of the provided URL is invalid. Ensure the URL includes a scheme, a
          domain name, and, optionally, a port. For example:{' '}
          <strong>https://api.openshift-domain.com:6443</strong>.
        </ForkliftTrans>
      </div>
    ),
    success: (
      <div className="forklift-edit-modal-field-success-validation">
        <ForkliftTrans>{'URL of the Openshift Virtualization API endpoint.'}</ForkliftTrans>
      </div>
    ),
    default: (
      <div className="forklift-edit-modal-field-default-validation">
        <ForkliftTrans>{'URL of the Openshift Virtualization API endpoint.'}</ForkliftTrans>
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
      body={t('URL of the Openshift Virtualization API endpoint.')}
      helperText={helperTextMsgs.default}
      validationHook={urlValidationHook}
      onConfirmHook={patchProviderURL}
    />
  );
};

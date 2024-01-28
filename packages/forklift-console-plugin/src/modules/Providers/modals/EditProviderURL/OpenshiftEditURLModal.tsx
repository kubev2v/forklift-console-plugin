import React from 'react';
import { Trans } from 'react-i18next';
import { useForkliftTranslation } from 'src/utils/i18n';

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
        <Trans t={t} ns="plugin__forklift-console-plugin">
          Error: The format of the provided URL is invalid. Ensure the URL includes a scheme, a
          domain name, and, optionally, a port. For example: {'<strong>'}
          https://api.&#8249;your-openshift-domain&#8250;:6443{'</strong>'}.
        </Trans>
      </div>
    ),
    success: (
      <div className="forklift-edit-modal-field-success-validation">
        <Trans t={t} ns="plugin__forklift-console-plugin">
          {'URL of the Openshift Virtualization API endpoint.'}
        </Trans>
      </div>
    ),
    default: (
      <div className="forklift-edit-modal-field-default-validation">
        <Trans t={t} ns="plugin__forklift-console-plugin">
          {'URL of the Openshift Virtualization API endpoint.'}
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

import React from 'react';
import { useForkliftTranslation } from 'src/utils/i18n';

import { ProviderModel } from '@kubev2v/types';
import { ModalVariant } from '@patternfly/react-core';

import { validateURL } from '../../utils';
import { EditModal, ValidationHookType } from '../EditModal';

import { patchProviderURL } from './utils/patchProviderURL';
import { EditProviderURLModalProps } from './EditProviderURLModal';

export const OvirtEditURLModal: React.FC<EditProviderURLModalProps> = (props) => {
  const { t } = useForkliftTranslation();

  const helperTextMsgs = {
    error: t(
      'Error: The format of the provided URL is invalid. Ensure the URL includes a scheme, a domain name, and a path. For example: https://rhv-host-example.com/ovirt-engine/api',
    ),
    warning: t(
      'Warning: The provided URL does not end with the RHVM API endpoint path: "/ovirt-engine/api". Ensure the URL includes the correct path. For example: https://rhv-host-example.com/ovirt-engine/api',
    ),
    success: t(
      'Ensure the URL includes the "/ovirt-engine/api" path. For example: https://rhv-host-example.com/ovirt-engine/api',
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
    if (!trimmedUrl.endsWith('ovirt-engine/api') && !trimmedUrl.endsWith('ovirt-engine/api/'))
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
      body={t(`URL of the Red Hat Virtualization Manager (RHVM) API endpoint.`)}
      helperText={helperTextMsgs.success}
      onConfirmHook={patchProviderURL}
      validationHook={urlValidationHook}
    />
  );
};

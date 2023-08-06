import React from 'react';
import { useForkliftTranslation } from 'src/utils/i18n';

import { ProviderModel } from '@kubev2v/types';
import { ModalVariant } from '@patternfly/react-core';

import { validateURL } from '../../utils';
import { EditModal, ValidationHookType } from '../EditModal';

import { patchProviderURL } from './utils/patchProviderURL';
import { EditProviderURLModalProps } from './EditProviderURLModal';

export const VSphereEditURLModal: React.FC<EditProviderURLModalProps> = (props) => {
  const { t } = useForkliftTranslation();

  const urlValidationHook: ValidationHookType = (value) => {
    const isValidURL = validateURL(value.toString().trim());

    return isValidURL
      ? {
          validationHelpText: undefined,
          validated: 'success',
        }
      : {
          validationHelpText: t(
            'URL must start with https:// or http:// and contain valid hostname and path',
          ),
          validated: 'error',
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
      body={t(
        'Specify vCenter host name or IP address - if a certificate for FQDN is specified, the value of this field needs to match the FQDN in the certificate.',
      )}
      helperText={t('Please enter URL for vSphere REST APIs server.')}
      onConfirmHook={patchProviderURL}
      validationHook={urlValidationHook}
    />
  );
};

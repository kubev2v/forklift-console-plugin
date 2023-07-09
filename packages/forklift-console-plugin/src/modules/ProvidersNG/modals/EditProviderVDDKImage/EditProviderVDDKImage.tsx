import React from 'react';
import { useForkliftTranslation } from 'src/utils/i18n';

import { Modify, ProviderModel, V1beta1Provider } from '@kubev2v/types';
import { K8sModel } from '@openshift-console/dynamic-plugin-sdk/lib/api/core-api';

import { validateContainerImage } from '../../utils';
import { EditModal, EditModalProps, ValidationHookType } from '../EditModal';

export type EditProviderVDDKImageProps = Modify<
  EditModalProps,
  {
    resource: V1beta1Provider;
    title?: string;
    label?: string;
    model?: K8sModel;
    jsonPath?: string | string[];
  }
>;

const EditProviderVDDKImage_: React.FC<EditProviderVDDKImageProps> = (props) => {
  const { t } = useForkliftTranslation();

  const imageValidationHook: ValidationHookType = (value) => {
    const trimmedValue = value.toString().trim();
    const isValidImage = trimmedValue === '' || validateContainerImage(value.toString().trim());

    return isValidImage
      ? {
          validationHelpText: undefined,
          validated: 'success',
        }
      : {
          validationHelpText: t(
            'VDDK Init Image must be a valid container image, for example quay.io/kubev2v/example:latest',
          ),
          validated: 'error',
        };
  };

  return (
    <EditModal
      {...props}
      jsonPath={'spec.settings.vddkInitImage'}
      title={props?.title || t('Edit VDDK Init Image')}
      label={props?.label || t('VDDK Init Image')}
      model={ProviderModel}
      body={t(
        'Specify the VDDK image that you created. some functionality will not be available if the VDDK image is left empty',
      )}
      validationHook={imageValidationHook}
    />
  );
};

export const EditProviderVDDKImage: React.FC<EditProviderVDDKImageProps> = (props) => {
  if (props.resource?.spec?.type !== 'vsphere') {
    return <></>;
  }

  return <EditProviderVDDKImage_ {...props} />;
};

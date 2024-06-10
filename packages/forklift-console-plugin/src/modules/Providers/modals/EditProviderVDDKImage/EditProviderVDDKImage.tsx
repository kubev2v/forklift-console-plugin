import React from 'react';
import { useForkliftTranslation } from 'src/utils/i18n';

import { Modify, ProviderModel, V1beta1Provider } from '@kubev2v/types';
import { K8sModel, k8sPatch } from '@openshift-console/dynamic-plugin-sdk';

import { VDDKHelperText } from '../../utils';
import { validateVDDKImage } from '../../utils/validators';
import { EditModal, EditModalProps, OnConfirmHookType } from '../EditModal';

/**
 * Handles the confirmation action for editing a resource annotations.
 * Adds or updates the vddkInitImage settings in the resource's spec.
 *
 * @param {Object} options - Options for the confirmation action.
 * @param {Object} options.resource - The resource to be modified.
 * @param {Object} options.model - The model associated with the resource.
 * @param {any} options.newValue - The new value for the 'vddkInitImage' spec settings.
 * @returns {Promise<Object>} - The modified resource.
 */
const onConfirm: OnConfirmHookType = async ({ resource, model, newValue: value }) => {
  const provider = resource as V1beta1Provider;
  const currentSettings = provider?.spec?.settings as object;
  const vddkInitImage: string = value as string;

  const settings = {
    ...currentSettings,
    vddkInitImage: vddkInitImage?.trim() || undefined,
  };

  const op = provider?.spec?.settings ? 'replace' : 'add';

  const obj = await k8sPatch({
    model: model,
    resource: resource,
    data: [
      {
        op,
        path: '/spec/settings',
        value: settings,
      },
    ],
  });

  return obj;
};

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

  return (
    <EditModal
      {...props}
      jsonPath={'spec.settings.vddkInitImage'}
      title={props?.title || t('Edit VDDK init image')}
      label={props?.label || t('VDDK init image')}
      model={ProviderModel}
      body={VDDKHelperText}
      validationHook={validateVDDKImage}
      onConfirmHook={onConfirm}
    />
  );
};

export const EditProviderVDDKImage: React.FC<EditProviderVDDKImageProps> = (props) => {
  if (props.resource?.spec?.type !== 'vsphere') {
    return <></>;
  }

  return <EditProviderVDDKImage_ {...props} />;
};

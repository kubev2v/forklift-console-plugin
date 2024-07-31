import React, { useState } from 'react';
import { useForkliftTranslation } from 'src/utils/i18n';

import { Modify, ProviderModel, V1beta1Provider } from '@kubev2v/types';
import { K8sModel } from '@openshift-console/dynamic-plugin-sdk';
import { Checkbox, Hint, HintBody, TextInput } from '@patternfly/react-core';

import { VDDKHelperTextShort } from '../../utils/components/VDDKHelperText';
import { validateVDDKImage } from '../../utils/validators';
import { EditModal, EditModalProps } from '../EditModal';

import { onEmptyVddkConfirm } from './onEmptyVddkConfirm';
import { onNoneEmptyVddkConfirm } from './onNoneEmptyVddkConfirm';

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

export const EditProviderVDDKImage: React.FC<EditProviderVDDKImageProps> = (props) => {
  const { t } = useForkliftTranslation();

  const provider = props.resource;

  const emptyVddkInitImage =
    provider?.metadata?.annotations?.['forklift.konveyor.io/empty-vddk-init-image'];

  const [emptyImage, setEmptyImage] = useState(emptyVddkInitImage);

  const isEmptyImage = emptyImage === 'yes';

  const onChange: (checked: boolean, event: React.FormEvent<HTMLInputElement>) => void = (
    checked,
  ) => {
    if (checked) {
      setEmptyImage('yes');
    } else {
      setEmptyImage(undefined);
    }
  };

  const body = (
    <Hint>
      <HintBody>
        <VDDKHelperTextShort />
        <Checkbox
          className="forklift-section-provider-edit-vddk-checkbox"
          label={t(
            'Skip VMware Virtual Disk Development Kit (VDDK) SDK acceleration, migration may be slow.',
          )}
          isChecked={isEmptyImage}
          onChange={onChange}
          id="emptyVddkInitImage"
          name="emptyVddkInitImage"
        />
      </HintBody>
    </Hint>
  );

  return (
    <EditModal
      {...props}
      jsonPath={'spec.settings.vddkInitImage'}
      title={props?.title || t('Edit VDDK init image')}
      label={props?.label || t('VDDK init image')}
      model={ProviderModel}
      body={body}
      validationHook={isEmptyImage ? validateEmptyVDDKImage : validateNoneEmptyVDDKImage}
      onConfirmHook={isEmptyImage ? onEmptyVddkConfirm : onNoneEmptyVddkConfirm}
      InputComponent={isEmptyImage ? EmptyVddkTextInput : VddkTextInput}
    />
  );
};

// VddkTextInput is the default text input
const VddkTextInput = undefined;

// EmptyVddkTextInput is a mock input item for the empty vddk image string
const EmptyVddkTextInput: React.FC = () => (
  <TextInput
    spellCheck="false"
    id="modal-with-form-form-field"
    name="modal-with-form-form-field"
    isDisabled={true}
    value={''}
  />
);

// Validation of empty vddk image
const validateEmptyVDDKImage = () => validateVDDKImage(undefined);

// Validation of none empty vddk image, make sure it's not undefined
const validateNoneEmptyVDDKImage = (value) => validateVDDKImage(value || '');

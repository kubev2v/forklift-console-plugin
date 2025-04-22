import { type FC, type FormEvent, useState } from 'react';
import { useForkliftTranslation } from 'src/utils/i18n';

import { type Modify, ProviderModel, type V1beta1Provider } from '@kubev2v/types';
import type { K8sModel } from '@openshift-console/dynamic-plugin-sdk';
import { Alert, Checkbox, TextInput } from '@patternfly/react-core';

import { VDDKHelperTextShort } from '../../utils/components/VDDKHelperText/VDDKHelperText';
import { validateVDDKImage } from '../../utils/validators/provider/vsphere/validateVDDKImage';
import { EditModal } from '../EditModal/EditModal';
import type { EditModalProps } from '../EditModal/types';

import { onEmptyVddkConfirm } from './onEmptyVddkConfirm';
import { onNoneEmptyVddkConfirm } from './onNoneEmptyVddkConfirm';

type EditProviderVDDKImageProps = Modify<
  EditModalProps,
  {
    resource: V1beta1Provider;
    title?: string;
    label?: string;
    model?: K8sModel;
    jsonPath?: string | string[];
  }
>;

export const EditProviderVDDKImage: FC<EditProviderVDDKImageProps> = (props) => {
  const { t } = useForkliftTranslation();

  const provider = props.resource;

  const emptyVddkInitImage =
    provider?.metadata?.annotations?.['forklift.konveyor.io/empty-vddk-init-image'];

  const [emptyImage, setEmptyImage] = useState(emptyVddkInitImage);

  const isEmptyImage = emptyImage === 'yes';

  const onChange: (checked: boolean, event: FormEvent<HTMLInputElement>) => void = (checked) => {
    if (checked) {
      setEmptyImage('yes');
    } else {
      setEmptyImage(undefined);
    }
  };

  const body = (
    <Alert variant="warning" isInline title={<VDDKHelperTextShort />}>
      <Checkbox
        className="forklift-section-provider-edit-vddk-checkbox"
        label={t(
          'Skip VMware Virtual Disk Development Kit (VDDK) SDK acceleration (not recommended).',
        )}
        isChecked={isEmptyImage}
        onChange={(event, value) => {
          onChange(value, event);
        }}
        id="emptyVddkInitImage"
        name="emptyVddkInitImage"
      />
    </Alert>
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
const EmptyVddkTextInput: FC = () => (
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

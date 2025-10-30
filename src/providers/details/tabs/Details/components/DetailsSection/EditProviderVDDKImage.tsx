import { type FormEvent, useState } from 'react';
import { EditModal } from 'src/modules/Providers/modals/EditModal/EditModal';
import type {
  EditModalProps,
  OnConfirmHookType,
} from 'src/modules/Providers/modals/EditModal/types';
import { VDDKHelperTextShort } from 'src/modules/Providers/utils/components/VDDKHelperText/VDDKHelperText';
import { validateVDDKImage } from 'src/modules/Providers/utils/validators/provider/vsphere/validateVDDKImage';
import { TRUE_VALUE, YES_VALUE } from 'src/providers/create/utils/constants';
import { EMPTY_VDDK_INIT_IMAGE_ANNOTATION } from 'src/providers/utils/constants';
import { useForkliftTranslation } from 'src/utils/i18n';

import { type Modify, ProviderModel, type V1beta1Provider } from '@kubev2v/types';
import type { K8sModel } from '@openshift-console/dynamic-plugin-sdk';
import type { ModalComponent } from '@openshift-console/dynamic-plugin-sdk/lib/app/modal-support/ModalProvider';
import { Alert, AlertVariant, Checkbox, Stack, StackItem } from '@patternfly/react-core';
import { getAnnotations, getUseVddkAioOptimization } from '@utils/crds/common/selectors';

import onUpdateVddkImageSettings from './onUpdateVddkImageSettings';

export type EditProviderVDDKImageProps = Modify<
  EditModalProps,
  {
    resource: V1beta1Provider;
    title?: string;
    model?: K8sModel;
    jsonPath?: string | string[];
  }
>;
const EditProviderVDDKImage: ModalComponent<EditProviderVDDKImageProps> = (props) => {
  const { t } = useForkliftTranslation();

  const provider = props.resource;

  const emptyVddkInitImage = getAnnotations(provider)?.[EMPTY_VDDK_INIT_IMAGE_ANNOTATION];
  const useVddkAioOptimization = getUseVddkAioOptimization(provider);

  const [emptyImage, setEmptyImage] = useState(emptyVddkInitImage);
  const [useVddkAio, setUseVddkAio] = useState(useVddkAioOptimization);

  const isEmptyImage = emptyImage === YES_VALUE;
  const isUseVddkAio = useVddkAio === TRUE_VALUE;

  // VddkTextInput is the default text input
  const VddkTextInput = undefined;

  // Validation of none empty vddk image, make sure it's not undefined
  const validateNoneEmptyVDDKImage = (value: string | number) => validateVDDKImage(value ?? '');

  const onChangeEmptyImage: (event: React.FormEvent<HTMLInputElement>, checked: boolean) => void = (
    _event,
    checked,
  ) => {
    if (checked) {
      setEmptyImage(YES_VALUE);
    } else {
      setEmptyImage(undefined);
    }
  };

  const onChangeUseVddkAio: (_event: FormEvent<HTMLInputElement>, checked: boolean) => void = (
    _event,
    checked,
  ) => {
    if (checked) {
      setUseVddkAio(TRUE_VALUE);
    } else {
      setUseVddkAio(undefined);
    }
  };

  const onConfirmHookForVddk: OnConfirmHookType = async ({ model, newValue, resource }) =>
    onUpdateVddkImageSettings(model ?? ProviderModel, resource, {
      isEmptyImage,
      isUseVddkAio,
      newValue: newValue as string,
    });

  const body = (
    <Stack hasGutter>
      <Alert variant={AlertVariant.warning} isInline title={<VDDKHelperTextShort />}>
        <Checkbox
          label={t(
            'Skip VMware Virtual Disk Development Kit (VDDK) SDK acceleration (not recommended).',
          )}
          isChecked={isEmptyImage}
          onChange={onChangeEmptyImage}
          id="emptyVddkInitImage"
          name="emptyVddkInitImage"
        />
      </Alert>
      {!isEmptyImage && (
        <StackItem isFilled={false}>
          <Checkbox
            label={t('Use VMware Virtual Disk Development Kit (VDDK) async IO Optimization.')}
            isChecked={isUseVddkAio && !isEmptyImage}
            onChange={onChangeUseVddkAio}
            id="useVddkAioOptimization"
            name="useVddkAioOptimization"
            isDisabled={isEmptyImage}
          />
        </StackItem>
      )}
    </Stack>
  );

  return (
    <EditModal
      {...props}
      jsonPath={'spec.settings.vddkInitImage'}
      title={props?.title ?? t('Edit VDDK init image')}
      label={t('VDDK init image')}
      model={ProviderModel}
      body={body}
      isVisible={!isEmptyImage}
      validationHook={validateNoneEmptyVDDKImage}
      InputComponent={VddkTextInput}
      onConfirmHook={onConfirmHookForVddk}
    />
  );
};

export default EditProviderVDDKImage;

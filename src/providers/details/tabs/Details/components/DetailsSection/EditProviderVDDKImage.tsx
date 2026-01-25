import { Controller, FormProvider, useForm } from 'react-hook-form';
import VDDKRadioSelection from 'src/providers/components/VDDKRadioSelection';
import { ProviderFormFieldId } from 'src/providers/create/fields/constants';
import { validateVddkInitImage } from 'src/providers/create/fields/vsphere/vsphereFieldValidators';
import { VddkSetupMode } from 'src/providers/utils/constants';
import { useForkliftTranslation } from 'src/utils/i18n';

import ModalForm from '@components/ModalForm/ModalForm';
import type { V1beta1Provider } from '@forklift-ui/types';
import type { ModalComponent } from '@openshift-console/dynamic-plugin-sdk/lib/app/modal-support/ModalProvider';
import { Form } from '@patternfly/react-core';
import { getUseVddkAioOptimization, getVddkInitImage } from '@utils/crds/common/selectors';
import { isEmpty } from '@utils/helpers';

import type { EditProviderVDDKImageFormData } from './utils/types';
import onUpdateVddkImageSettings from './onUpdateVddkImageSettings';
export type EditProviderVDDKImageProps = {
  provider: V1beta1Provider;
};

const EditProviderVDDKImage: ModalComponent<EditProviderVDDKImageProps> = ({
  closeModal,
  provider,
}) => {
  const { t } = useForkliftTranslation();

  const methods = useForm<EditProviderVDDKImageFormData>({
    defaultValues: {
      [ProviderFormFieldId.VsphereUseVddkAioOptimization]: getUseVddkAioOptimization(provider),
      [ProviderFormFieldId.VsphereVddkInitImage]: getVddkInitImage(provider),
      [ProviderFormFieldId.VsphereVddkSetupMode]: isEmpty(getVddkInitImage(provider))
        ? VddkSetupMode.Skip
        : VddkSetupMode.Manual,
    },
  });

  const { control, handleSubmit, watch } = methods;

  const vddkInitImage = watch(ProviderFormFieldId.VsphereVddkInitImage);

  const onSubmit = async (data: EditProviderVDDKImageFormData) => {
    await onUpdateVddkImageSettings(provider, data);
    closeModal();
  };

  return (
    <FormProvider {...methods}>
      <ModalForm
        closeModal={closeModal}
        title={t('Edit VDDK image')}
        onConfirm={handleSubmit(onSubmit)}
      >
        <Form>
          <Controller
            control={control}
            name={ProviderFormFieldId.VsphereVddkSetupMode}
            rules={{
              required: t('VDDK setup selection is required'),
              validate: {
                validImage: (mode: VddkSetupMode | undefined) => {
                  if (mode === VddkSetupMode.Skip) {
                    return undefined;
                  }
                  if (mode === VddkSetupMode.Manual) {
                    return validateVddkInitImage(vddkInitImage);
                  }
                  return undefined;
                },
              },
            }}
            render={() => <VDDKRadioSelection />}
          />
        </Form>
      </ModalForm>
    </FormProvider>
  );
};

export default EditProviderVDDKImage;

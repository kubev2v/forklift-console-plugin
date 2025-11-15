import { FormProvider, useForm } from 'react-hook-form';

import ModalForm from '@components/ModalForm/ModalForm';
import { ADD, REPLACE } from '@components/ModalForm/utils/constants';
import { ForkliftControllerModel, type V1beta1ForkliftController } from '@kubev2v/types';
import { k8sPatch } from '@openshift-console/dynamic-plugin-sdk';
import type { ModalComponent } from '@openshift-console/dynamic-plugin-sdk/lib/app/modal-support/ModalProvider';
import { Form, ModalVariant } from '@patternfly/react-core';
import { deepCopy } from '@utils/deepCopy';
import { useForkliftTranslation } from '@utils/i18n';

import type {
  EnhancedForkliftController,
  ForkliftSettingsValues,
  SettingsEditProps,
} from '../utils/types';
import { getDefaultValues } from '../utils/utils';

import EditControllerCPULimit from './EditControllerCPULimit';
import EditControllerMemoryLimit from './EditControllerMemoryLimit';
import EditInventoryMemoryLimit from './EditInventoryMemoryLimit';
import EditMaxVMInFlight from './EditMaxVMInFlight';
import EditPreCopyInterval from './EditPreCopyInterval';
import EditSnapshotPoolingInterval from './EditSnapshotPoolingInterval';

const SettingsEdit: ModalComponent<SettingsEditProps> = ({ closeModal, controller }) => {
  const { t } = useForkliftTranslation();

  const methods = useForm<ForkliftSettingsValues>({
    defaultValues: getDefaultValues(controller as EnhancedForkliftController),
  });

  const {
    formState: { isDirty },
    handleSubmit,
  } = methods;

  const onSubmit = async (formData: ForkliftSettingsValues) => {
    if (!isDirty) {
      closeModal();
      return;
    }

    const dirtyFields = Object.keys(methods.formState.dirtyFields).reduce<
      Record<string, string | number>
    >((acc, key) => {
      const typedKey = key as keyof ForkliftSettingsValues;
      if (formData[typedKey]) {
        acc[typedKey] = formData[typedKey];
      }
      return acc;
    }, {});

    const spec = deepCopy(controller?.spec) as Record<string, string | number>;
    const op = spec ? REPLACE : ADD;
    const updatedSpec = { ...spec, ...dirtyFields };
    await k8sPatch<V1beta1ForkliftController>({
      data: [
        {
          op,
          path: '/spec',
          value: updatedSpec,
        },
      ],
      model: ForkliftControllerModel,
      resource: controller,
    });
  };

  return (
    <FormProvider {...methods}>
      <ModalForm
        onConfirm={handleSubmit(onSubmit)}
        title={t('Edit Settings')}
        closeModal={closeModal}
        variant={ModalVariant.medium}
      >
        <Form>
          {t(
            'Settings are applied across all projects on the Migration Toolkit for Virtualization operator.',
          )}
          <EditMaxVMInFlight />
          <EditControllerCPULimit />
          <EditControllerMemoryLimit />
          <EditInventoryMemoryLimit />
          <EditPreCopyInterval />
          <EditSnapshotPoolingInterval />
        </Form>
      </ModalForm>
    </FormProvider>
  );
};

export default SettingsEdit;

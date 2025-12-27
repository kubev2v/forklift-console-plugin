import { FormProvider, useForm } from 'react-hook-form';

import ModalForm from '@components/ModalForm/ModalForm';
import { ADD, REPLACE } from '@components/ModalForm/utils/constants';
import { ForkliftControllerModel, type V1beta1ForkliftController } from '@kubev2v/types';
import { k8sPatch } from '@openshift-console/dynamic-plugin-sdk';
import type { ModalComponent } from '@openshift-console/dynamic-plugin-sdk/lib/app/modal-support/ModalProvider';
import { Form, ModalVariant } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import type {
  EnhancedForkliftController,
  ForkliftSettingsValues,
  SettingsEditProps,
} from '../utils/types';
import { getDefaultValues } from '../utils/utils';

import EditControllerCPULimit from './ControllerCPULimit/EditControllerCPULimit';
import EditControllerMemoryLimit from './ControllerMemoryLimit/EditControllerMemoryLimit';
import EditControllerTransferNetwork from './ControllerTransferNetwork/EditControllerTransferNetwork';
import EditInventoryMemoryLimit from './InventoryMemoryLimit/EditInventoryMemoryLimit';
import EditMaxVMInFlight from './MaxVMInFlight/EditMaxVMInFlight';
import EditPreCopyInterval from './PreCopyInterval/EditPreCopyInterval';
import EditSnapshotPoolingInterval from './SnapshotPoolingInterval/EditSnapshotPoolingInterval';
const SettingsEdit: ModalComponent<SettingsEditProps> = ({ closeModal, controller }) => {
  const { t } = useForkliftTranslation();

  const methods = useForm<ForkliftSettingsValues>({
    defaultValues: getDefaultValues(controller as EnhancedForkliftController),
  });

  const {
    formState: { dirtyFields, isDirty },
    handleSubmit,
  } = methods;

  const onSubmit = async (formData: ForkliftSettingsValues) => {
    if (!isDirty) {
      closeModal();
      return;
    }

    const patches = Object.keys(dirtyFields).map((key) => {
      const fieldKey = key as keyof ForkliftSettingsValues;
      const currentValue = (controller?.spec as Record<string, string | number>)?.[fieldKey];
      if (!formData[fieldKey]) {
        return {
          op: 'remove',
          path: `/spec/${fieldKey}`,
        };
      }

      return {
        op: currentValue ? REPLACE : ADD,
        path: `/spec/${fieldKey}`,
        value: formData[fieldKey],
      };
    });

    await k8sPatch<V1beta1ForkliftController>({
      data: patches,
      model: ForkliftControllerModel,
      resource: controller,
    });
  };

  return (
    <FormProvider {...methods}>
      <ModalForm
        onConfirm={handleSubmit(onSubmit)}
        title={t('Edit settings')}
        closeModal={closeModal}
        variant={ModalVariant.medium}
        isDisabled={!isDirty}
        testId="settings-edit-modal"
      >
        <Form>
          {t(
            'Settings are applied across all projects on the migration toolkit for virtualization operator.',
          )}
          <EditMaxVMInFlight />
          <EditControllerCPULimit />
          <EditControllerMemoryLimit />
          <EditInventoryMemoryLimit />
          <EditPreCopyInterval />
          <EditSnapshotPoolingInterval />
          <EditControllerTransferNetwork />
        </Form>
      </ModalForm>
    </FormProvider>
  );
};

export default SettingsEdit;

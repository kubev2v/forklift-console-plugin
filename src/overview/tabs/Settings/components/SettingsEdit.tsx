import { FormProvider, useForm } from 'react-hook-form';

import ModalForm from '@components/ModalForm/ModalForm';
import { ForkliftControllerModel, type V1beta1ForkliftController } from '@forklift-ui/types';
import { k8sPatch } from '@openshift-console/dynamic-plugin-sdk';
import type { OverlayComponent } from '@openshift-console/dynamic-plugin-sdk/lib/app/modal-support/OverlayProvider';
import { ButtonVariant, Form, ModalVariant } from '@patternfly/react-core';
import { getNamespace } from '@utils/crds/common/selectors';
import { useForkliftTranslation } from '@utils/i18n';

import { defaultValuesMap } from '../utils/constants';
import type {
  EnhancedForkliftController,
  ForkliftSettingsValues,
  SettingsEditProps,
} from '../utils/types';
import { buildSettingsPatches, getDefaultValues } from '../utils/utils';

import EditAapTimeout from './AapTimeout/EditAapTimeout';
import EditAapTokenSecret from './AapTokenSecret/EditAapTokenSecret';
import EditAapUrl from './AapUrl/EditAapUrl';
import EditControllerCPULimit from './ControllerCPULimit/EditControllerCPULimit';
import EditControllerMemoryLimit from './ControllerMemoryLimit/EditControllerMemoryLimit';
import EditControllerTransferNetwork from './ControllerTransferNetwork/EditControllerTransferNetwork';
import EditInventoryMemoryLimit from './InventoryMemoryLimit/EditInventoryMemoryLimit';
import EditMaxVMInFlight from './MaxVMInFlight/EditMaxVMInFlight';
import EditPreCopyInterval from './PreCopyInterval/EditPreCopyInterval';
import EditSnapshotPoolingInterval from './SnapshotPoolingInterval/EditSnapshotPoolingInterval';
import EditVirtV2vMemsize from './VirtV2vMemsize/EditVirtV2vMemsize';
import EditVirtV2vSmp from './VirtV2vSmp/EditVirtV2vSmp';

const SettingsEdit: OverlayComponent<SettingsEditProps> = ({ closeOverlay, controller }) => {
  const { t } = useForkliftTranslation();

  const methods = useForm<ForkliftSettingsValues>({
    defaultValues: getDefaultValues(controller as EnhancedForkliftController),
  });

  const {
    formState: { dirtyFields, isDirty },
    handleSubmit,
    reset,
  } = methods;

  const onSubmit = async (formData: ForkliftSettingsValues) => {
    if (!isDirty) {
      closeOverlay();
      return;
    }

    const patches = buildSettingsPatches(
      dirtyFields,
      formData,
      controller?.spec as Record<string, unknown>,
    );

    await k8sPatch<V1beta1ForkliftController>({
      data: patches,
      model: ForkliftControllerModel,
      resource: controller,
    });
  };

  return (
    <FormProvider {...methods}>
      <ModalForm
        additionalAction={{
          children: t('Reset to defaults'),
          onClick: () => {
            reset(defaultValuesMap as ForkliftSettingsValues, {
              keepDefaultValues: true,
            });
          },
          variant: ButtonVariant.secondary,
        }}
        closeModal={closeOverlay}
        isDisabled={!isDirty}
        onConfirm={handleSubmit(onSubmit)}
        testId="settings-edit-modal"
        title={t('Edit settings')}
        variant={ModalVariant.medium}
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
          <EditVirtV2vMemsize />
          <EditVirtV2vSmp />
          <EditControllerTransferNetwork />
          <EditAapUrl />
          <EditAapTokenSecret namespace={getNamespace(controller) ?? ''} />
          <EditAapTimeout />
        </Form>
      </ModalForm>
    </FormProvider>
  );
};

export default SettingsEdit;

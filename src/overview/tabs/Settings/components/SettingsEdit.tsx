import { useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import ModalForm from '@components/ModalForm/ModalForm';
import { ADD, REMOVE, REPLACE } from '@components/ModalForm/utils/constants';
import { ForkliftControllerModel, type V1beta1ForkliftController } from '@forklift-ui/types';
import { k8sPatch } from '@openshift-console/dynamic-plugin-sdk';
import type { ModalComponent } from '@openshift-console/dynamic-plugin-sdk/lib/app/modal-support/ModalProvider';
import { Form, ModalVariant } from '@patternfly/react-core';
import { getNamespace } from '@utils/crds/common/selectors';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

import { defaultValuesMap } from '../utils/constants';
import {
  type EnhancedForkliftController,
  type ForkliftSettingsValues,
  type SettingsEditProps,
  SettingsFields,
} from '../utils/types';
import { getDefaultValues } from '../utils/utils';

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
const SettingsEdit: ModalComponent<SettingsEditProps> = ({ closeModal, controller }) => {
  const { t } = useForkliftTranslation();

  const methods = useForm<ForkliftSettingsValues>({
    defaultValues: getDefaultValues(controller as EnhancedForkliftController),
    mode: 'onChange',
  });

  const {
    formState: { dirtyFields, isDirty, isValid },
    handleSubmit,
    reset,
    trigger,
  } = methods;

  // mode: 'onChange' skips defaultValues until edited; surface a pre-existing invalid aap_url
  // so admins see why Save stays blocked when other settings are dirty.
  useEffect(() => {
    trigger(SettingsFields.AapUrl).catch(() => undefined);
  }, [trigger]);

  const onSubmit = async (formData: ForkliftSettingsValues) => {
    if (!isDirty) {
      closeModal();
      return;
    }

    const patches = Object.keys(dirtyFields).map((key) => {
      const fieldKey = key as keyof ForkliftSettingsValues;
      const currentValue = (controller?.spec as Record<string, string | number>)?.[fieldKey];
      const newValue = formData[fieldKey];

      if (newValue === undefined || isEmpty(String(newValue))) {
        return {
          op: REMOVE,
          path: `/spec/${fieldKey}`,
        };
      }

      return {
        op: currentValue === undefined ? ADD : REPLACE,
        path: `/spec/${fieldKey}`,
        value: newValue,
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
        additionalAction={{
          children: t('Reset to defaults'),
          onClick: () => {
            reset(defaultValuesMap as ForkliftSettingsValues, {
              keepDefaultValues: true,
            });
          },
          variant: ButtonVariant.secondary,
        }}
        closeOverlay={closeOverlay}
        isDisabled={!isDirty || !isValid}
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
          <EditAapUrl />
          <EditAapTokenSecret namespace={getNamespace(controller)!} />
          <EditAapTimeout />
        </Form>
      </ModalForm>
    </FormProvider>
  );
};

export default SettingsEdit;

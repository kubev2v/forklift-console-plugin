import { FormProvider, useForm } from 'react-hook-form';
import { PROVIDER_TYPES } from 'src/providers/utils/constants';
import { transformFormValuesToK8sSpec } from 'src/storageMaps/details/utils/utils';
import { StorageMapFieldId } from 'src/storageMaps/utils/types';

import ModalForm from '@components/ModalForm/ModalForm';
import { ADD, REPLACE } from '@components/ModalForm/utils/constants';
import { StorageMapModel } from '@kubev2v/types';
import { k8sPatch } from '@openshift-console/dynamic-plugin-sdk';
import type { ModalComponent } from '@openshift-console/dynamic-plugin-sdk/lib/app/modal-support/ModalProvider';
import { Alert, AlertVariant, ModalVariant, Stack } from '@patternfly/react-core';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

import PlanStorageMapFieldsTable from './components/PlanStorageMapFieldsTable';
import type { PlanStorageEditFormValues, PlanStorageMapEditProps } from './utils/types';
const PlanStorageMapEdit: ModalComponent<PlanStorageMapEditProps> = ({
  closeModal,
  isLoading,
  loadError,
  otherSourceStorages,
  sourceProvider,
  storageMap,
  storageMappings,
  targetStorages,
  usedSourceStorages,
}) => {
  const { t } = useForkliftTranslation();

  const methods = useForm<PlanStorageEditFormValues>({
    defaultValues: {
      [StorageMapFieldId.StorageMap]: storageMappings,
    },
    mode: 'onChange',
  });

  const {
    formState: { isDirty, isValid },
    getFieldState,
    handleSubmit,
  } = methods;

  const { error } = getFieldState(StorageMapFieldId.StorageMap);

  const onSubmit = async (formValues: PlanStorageEditFormValues) => {
    if (!isValid) {
      return;
    }

    const filteredStorageMap = formValues.storageMap?.filter((mapping) => {
      const hasSource = Boolean(mapping[StorageMapFieldId.SourceStorage]?.name);
      const hasTarget = Boolean(mapping[StorageMapFieldId.TargetStorage]?.name);

      return hasSource || hasTarget;
    });

    const updatedStorageMap = transformFormValuesToK8sSpec(
      { storageMap: filteredStorageMap },
      storageMap,
      sourceProvider?.spec?.type === PROVIDER_TYPES.openshift,
    );

    if (updatedStorageMap) {
      await k8sPatch({
        data: [
          {
            op: isEmpty(storageMap?.spec?.map) ? ADD : REPLACE,
            path: '/spec/map',
            value: updatedStorageMap.spec?.map ?? [],
          },
        ],
        model: StorageMapModel,
        resource: storageMap,
      });
    }
  };

  return (
    <FormProvider {...methods}>
      <ModalForm
        onConfirm={handleSubmit(onSubmit)}
        title={t('Edit storage map')}
        closeModal={closeModal}
        variant={ModalVariant.medium}
        isDisabled={!isValid || !isDirty}
      >
        <Stack hasGutter>
          {error?.root && (
            <Alert variant={AlertVariant.danger} isInline title={error.root.message} />
          )}

          {isEmpty(usedSourceStorages) && !isLoading && (
            <Alert
              variant={AlertVariant.warning}
              isInline
              title={t('No source storages are available for the selected VMs.')}
            />
          )}
          <PlanStorageMapFieldsTable
            isLoading={isLoading}
            loadError={loadError}
            otherSourceStorages={otherSourceStorages}
            sourceProvider={sourceProvider}
            targetStorages={targetStorages}
            usedSourceStorages={usedSourceStorages}
          />
        </Stack>
      </ModalForm>
    </FormProvider>
  );
};

export default PlanStorageMapEdit;

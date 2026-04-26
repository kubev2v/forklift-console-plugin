import { FormProvider, useForm } from 'react-hook-form';
import { isHypervIscsiProvider } from 'src/providers/utils/helpers/isHypervIscsiProvider';
import StorageMapStatusAlerts from 'src/storageMaps/components/StorageMapStatusAlerts';
import { StorageMapFieldId } from 'src/storageMaps/utils/types';

import ModalForm from '@components/ModalForm/ModalForm';
import type { ModalComponent } from '@openshift-console/dynamic-plugin-sdk/lib/app/modal-support/ModalProvider';
import { Alert, AlertVariant, ModalVariant, Stack } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';

import PlanStorageMapFieldsTable from './components/PlanStorageMapFieldsTable';
import type { PlanStorageEditFormValues, PlanStorageMapEditProps } from './utils/types';
import { patchStorageMappingValues } from './utils/utils';

const PlanStorageMapEdit: ModalComponent<PlanStorageMapEditProps> = ({
  closeModal,
  isLoading,
  loadError,
  otherSourceStorages,
  sourceProvider,
  sourceStorages,
  storageMap,
  storageMappings,
  targetStorages,
  usedSourceStorages,
}) => {
  const { t } = useForkliftTranslation();
  const isIscsi = isHypervIscsiProvider(sourceProvider);

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

    await patchStorageMappingValues(formValues, storageMap, sourceProvider);
  };

  return (
    <FormProvider {...methods}>
      <ModalForm
        onConfirm={handleSubmit(onSubmit)}
        title={t('Edit storage map')}
        closeModal={closeModal}
        variant={ModalVariant.medium}
        isDisabled={!isValid || !isDirty}
        testId="edit-storage-map-modal"
      >
        <Stack hasGutter>
          {error?.root && (
            <Alert variant={AlertVariant.danger} isInline title={error.root.message} />
          )}

          <StorageMapStatusAlerts
            isIscsi={isIscsi}
            isLoading={isLoading}
            usedSourceStorages={usedSourceStorages}
          />
          <PlanStorageMapFieldsTable
            isLoading={isLoading}
            loadError={loadError}
            otherSourceStorages={otherSourceStorages}
            sourceProvider={sourceProvider}
            sourceStorages={sourceStorages}
            targetStorages={targetStorages}
            usedSourceStorages={usedSourceStorages}
            isIscsi={isIscsi}
          />
        </Stack>
      </ModalForm>
    </FormProvider>
  );
};

export default PlanStorageMapEdit;

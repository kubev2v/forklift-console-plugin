import { FormProvider, useForm } from 'react-hook-form';
import { isHypervIscsiProvider } from 'src/providers/utils/helpers/isHypervIscsiProvider';
import StorageMapStatusAlerts from 'src/storageMaps/components/StorageMapStatusAlerts';

import ModalForm from '@components/ModalForm/ModalForm';
import type { OverlayComponent } from '@openshift-console/dynamic-plugin-sdk/lib/app/modal-support/OverlayProvider';
import { Alert, AlertVariant, ModalVariant, Stack } from '@patternfly/react-core';
import { useForkliftTranslation } from '@utils/i18n';
import { StorageMapFieldId } from '@utils/storage/types';

import PlanStorageMapFieldsTable from './components/PlanStorageMapFieldsTable';
import type { PlanStorageEditFormValues, PlanStorageMapEditProps } from './utils/types';
import { patchStorageMappingValues } from './utils/utils';

const PlanStorageMapEdit: OverlayComponent<PlanStorageMapEditProps> = ({
  closeOverlay,
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

  const onSubmit = async (formValues: PlanStorageEditFormValues): Promise<void> => {
    if (!isValid) {
      return;
    }

    await patchStorageMappingValues(formValues, storageMap, sourceProvider);
  };

  return (
    <FormProvider {...methods}>
      <ModalForm
        closeOverlay={closeOverlay}
        isDisabled={!isValid || !isDirty}
        onConfirm={handleSubmit(onSubmit)}
        testId="edit-storage-map-modal"
        title={t('Edit storage map')}
        variant={ModalVariant.medium}
      >
        <Stack hasGutter>
          {error?.root && (
            <Alert isInline title={error.root.message} variant={AlertVariant.danger} />
          )}

          <StorageMapStatusAlerts
            isIscsi={isIscsi}
            isLoading={isLoading}
            usedSourceStorages={usedSourceStorages}
          />
          <PlanStorageMapFieldsTable
            isIscsi={isIscsi}
            isLoading={isLoading}
            loadError={loadError}
            otherSourceStorages={otherSourceStorages}
            sourceProvider={sourceProvider}
            sourceStorages={sourceStorages}
            targetStorages={targetStorages}
            usedSourceStorages={usedSourceStorages}
          />
        </Stack>
      </ModalForm>
    </FormProvider>
  );
};

export default PlanStorageMapEdit;

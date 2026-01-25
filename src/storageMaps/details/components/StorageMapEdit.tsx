import { useEffect, useMemo } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { getMapResourceLabel } from 'src/plans/create/steps/utils';
import { PROVIDER_TYPES } from 'src/providers/utils/constants';
import { StorageMapFieldId } from 'src/storageMaps/utils/types';
import { useSourceStorages } from 'src/utils/hooks/useStorages';

import { FormErrorHelperText } from '@components/FormErrorHelperText';
import ModalForm from '@components/ModalForm/ModalForm';
import { ADD, REPLACE } from '@components/ModalForm/utils/constants';
import { StorageMapModel, type V1beta1Provider, type V1beta1StorageMap } from '@kubev2v/types';
import { k8sPatch } from '@openshift-console/dynamic-plugin-sdk';
import type { ModalComponent } from '@openshift-console/dynamic-plugin-sdk/lib/app/modal-support/ModalProvider';
import { ModalVariant } from '@patternfly/react-core';
import { getNamespace } from '@utils/crds/common/selectors';
import { isEmpty } from '@utils/helpers';
import useTargetStorages from '@utils/hooks/useTargetStorages';
import { useForkliftTranslation } from '@utils/i18n';

import type { UpdateMappingsFormData } from '../utils/types';
import { transformFormValuesToK8sSpec, transformStorageMapToFormValues } from '../utils/utils';

import UpdateStorageMapFieldTable from './UpdateStorageMapFieldTable';

export type StorageMapEditProps = {
  storageMap: V1beta1StorageMap;
  sourceProvider: V1beta1Provider;
  destinationProvider: V1beta1Provider;
};

const StorageMapEdit: ModalComponent<StorageMapEditProps> = ({
  closeModal,
  destinationProvider,
  sourceProvider,
  storageMap,
}) => {
  const { t } = useForkliftTranslation();
  const storageMapNamespace = getNamespace(storageMap);

  const [sourceStorages, sourceStoragesLoading, sourceStoragesLoadError] =
    useSourceStorages(sourceProvider);

  const [targetStorages, targetStoragesLoading, targetStoragesLoadError] = useTargetStorages(
    destinationProvider,
    storageMapNamespace,
  );

  const allSourceStorages = useMemo(
    () =>
      sourceStorages?.map((storage) => ({
        id: storage.id,
        name: getMapResourceLabel(storage),
      })) ?? [],
    [sourceStorages],
  );

  const initialFormValues = useMemo(
    () => transformStorageMapToFormValues(storageMap),
    [storageMap],
  );

  const methods = useForm<UpdateMappingsFormData>({
    defaultValues: initialFormValues,
    mode: 'onChange',
  });

  const {
    formState: { isDirty, isValid },
    getFieldState,
    handleSubmit,
    reset,
  } = methods;

  const { error } = getFieldState(StorageMapFieldId.StorageMap);
  // Reset form when storageMap changes
  useEffect(() => {
    reset(initialFormValues);
  }, [initialFormValues, reset]);

  const onSubmit = async (formValues: UpdateMappingsFormData) => {
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

  const isLoading = sourceStoragesLoading || targetStoragesLoading;
  const loadError = sourceStoragesLoadError ?? targetStoragesLoadError;

  return (
    <FormProvider {...methods}>
      <ModalForm
        onConfirm={handleSubmit(onSubmit)}
        title={t('Edit storage map')}
        closeModal={closeModal}
        variant={ModalVariant.medium}
        isDisabled={!isValid || !isDirty}
      >
        <UpdateStorageMapFieldTable
          targetStorages={targetStorages}
          sourceStorages={allSourceStorages}
          isLoading={isLoading}
          loadError={loadError}
          isVsphere={sourceProvider?.spec?.type === PROVIDER_TYPES.vsphere}
          sourceProvider={sourceProvider}
        />
        {error?.root && <FormErrorHelperText error={error.root} />}
      </ModalForm>
    </FormProvider>
  );
};

export default StorageMapEdit;

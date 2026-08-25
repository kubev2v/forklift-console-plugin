import { useEffect, useMemo } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { getMapResourceLabel } from 'src/plans/create/steps/utils';
import { useSourceStorages } from 'src/utils/hooks/useStorages';

import { FormErrorHelperText } from '@components/FormErrorHelperText';
import ModalForm from '@components/ModalForm/ModalForm';
import {
  ProviderModelGroupVersionKind,
  type V1beta1Provider,
  type V1beta1StorageMap,
} from '@forklift-ui/types';
import type { OverlayComponent } from '@openshift-console/dynamic-plugin-sdk/lib/app/modal-support/OverlayProvider';
import { ModalVariant, Spinner } from '@patternfly/react-core';
import { getNamespace } from '@utils/crds/common/selectors';
import {
  getMapDestinationProviderName,
  getMapDestinationProviderNamespace,
  getMapSourceProviderName,
  getMapSourceProviderNamespace,
} from '@utils/crds/maps/selectors';
import { useK8sWatchResource } from '@utils/hooks/useK8sWatchResource';
import useTargetStorages from '@utils/hooks/useTargetStorages';
import { useForkliftTranslation } from '@utils/i18n';
import { PROVIDER_TYPES } from '@utils/providers/constants';
import { StorageMapFieldId } from '@utils/storage/types';

import { patchStorageMapMappings } from '../utils/patchStorageMapMappings';
import { resolveProvider } from '../utils/resolveProvider';
import type { UpdateMappingsFormData } from '../utils/types';
import { transformStorageMapToFormValues } from '../utils/utils';

import UpdateStorageMapFieldTable from './UpdateStorageMapFieldTable';

export type StorageMapEditProps = {
  destinationProvider?: V1beta1Provider;
  sourceProvider?: V1beta1Provider;
  storageMap: V1beta1StorageMap;
};

const StorageMapEdit: OverlayComponent<StorageMapEditProps> = ({
  closeOverlay,
  destinationProvider: launchedDestinationProvider,
  sourceProvider: launchedSourceProvider,
  storageMap,
}) => {
  const { t } = useForkliftTranslation();
  const storageMapNamespace = getNamespace(storageMap);

  const [watchedSourceProvider, sourceProviderLoaded] = useK8sWatchResource<V1beta1Provider>({
    groupVersionKind: ProviderModelGroupVersionKind,
    isList: false,
    name: getMapSourceProviderName(storageMap),
    namespace: getMapSourceProviderNamespace(storageMap),
    namespaced: true,
  });
  const [watchedDestinationProvider, destinationProviderLoaded] =
    useK8sWatchResource<V1beta1Provider>({
      groupVersionKind: ProviderModelGroupVersionKind,
      isList: false,
      name: getMapDestinationProviderName(storageMap),
      namespace: getMapDestinationProviderNamespace(storageMap),
      namespaced: true,
    });

  const sourceProvider = resolveProvider(
    watchedSourceProvider,
    sourceProviderLoaded,
    launchedSourceProvider,
  );
  const destinationProvider = resolveProvider(
    watchedDestinationProvider,
    destinationProviderLoaded,
    launchedDestinationProvider,
  );
  const providersReady = Boolean(
    sourceProvider?.metadata?.uid && destinationProvider?.metadata?.uid,
  );

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

  useEffect(() => {
    reset(initialFormValues);
  }, [initialFormValues, reset]);

  const isLoading = !providersReady || sourceStoragesLoading || targetStoragesLoading;
  const loadError = sourceStoragesLoadError ?? targetStoragesLoadError;

  return (
    <FormProvider {...methods}>
      <ModalForm
        closeOverlay={closeOverlay}
        isDisabled={!isValid || !isDirty || !providersReady}
        onConfirm={handleSubmit(async (formValues) => {
          await patchStorageMapMappings(formValues, storageMap, sourceProvider);
        })}
        testId="edit-storage-map-modal"
        title={t('Edit storage map')}
        variant={ModalVariant.medium}
      >
        {providersReady ? (
          <UpdateStorageMapFieldTable
            inventorySourceStorages={sourceStorages ?? []}
            isLoading={isLoading}
            isVsphere={sourceProvider?.spec?.type === PROVIDER_TYPES.vsphere}
            loadError={loadError}
            sourceProvider={sourceProvider}
            sourceStorages={allSourceStorages}
            targetStorages={targetStorages}
          />
        ) : (
          <Spinner size="lg" />
        )}
        {error?.root && <FormErrorHelperText error={error.root} />}
      </ModalForm>
    </FormProvider>
  );
};

export default StorageMapEdit;

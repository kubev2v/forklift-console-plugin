import { type FC, useMemo, useState } from 'react';
import { useSourceStorages } from 'src/modules/Providers/hooks/useStorages';
import { PROVIDER_TYPES } from 'src/providers/utils/constants';

import { StorageMapModel, type V1beta1StorageMap } from '@kubev2v/types';
import { k8sUpdate } from '@openshift-console/dynamic-plugin-sdk';
import { Alert, AlertActionCloseButton, AlertVariant, Stack } from '@patternfly/react-core';
import { getNamespace } from '@utils/crds/common/selectors';
import useTargetStorages from '@utils/hooks/useTargetStorages';
import { useForkliftTranslation } from '@utils/i18n';

import { getSourceStorageValues } from '../utils/getSourceStorageValues';

import { useProviderInventoryVms } from './hooks/useProviderInventoryVms';
import { useStorageMapProviders } from './hooks/useStorageMapProviders';
import UpdateStorageMapForm from './UpdateStorageMapForm/UpdateStorageMapForm';
import type { UpdateMappingsFormData } from './constants';
import { transformFormValuesToK8sSpec } from './utils';

type MapsSectionProps = {
  storageMap: V1beta1StorageMap;
};

const MapsSection: FC<MapsSectionProps> = ({ storageMap }) => {
  const { t } = useForkliftTranslation();
  const [updateError, setUpdateError] = useState<Error>();
  const storageMapNamespace = getNamespace(storageMap);

  const { providersLoaded, providersLoadError, sourceProvider, targetProvider } =
    useStorageMapProviders(storageMap);

  const [sourceStorages, sourceStoragesLoading, sourceStoragesLoadError] =
    useSourceStorages(sourceProvider);

  const [targetStorages, targetStoragesLoading, targetStoragesLoadError] = useTargetStorages(
    targetProvider,
    storageMapNamespace,
  );

  const {
    error: inventoryLoadError,
    inventory: inventoryVms,
    loading: inventoryLoading,
  } = useProviderInventoryVms(sourceProvider, providersLoaded && !providersLoadError);

  const { other: otherSourceStorages, used: usedSourceStorages } = useMemo(
    () => getSourceStorageValues(sourceProvider, sourceStorages, inventoryVms),
    [sourceProvider, sourceStorages, inventoryVms],
  );

  const handleUpdate = async (formValues: UpdateMappingsFormData) => {
    setUpdateError(undefined);

    try {
      const updatedStorageMap = transformFormValuesToK8sSpec(formValues, storageMap);

      if (updatedStorageMap) {
        await k8sUpdate({
          data: updatedStorageMap,
          model: StorageMapModel,
        });
      }
    } catch (error) {
      setUpdateError(error as Error);
      throw error; // Re-throw so form component can handle loading state
    }
  };

  const handleCancel = () => {
    setUpdateError(undefined);
  };

  const isLoading =
    !providersLoaded || sourceStoragesLoading || targetStoragesLoading || inventoryLoading;
  const loadError =
    providersLoadError ?? sourceStoragesLoadError ?? targetStoragesLoadError ?? inventoryLoadError;

  return (
    <Stack hasGutter>
      {updateError?.message && (
        <Alert
          variant={AlertVariant.danger}
          title={t('Error updating storage map')}
          actionClose={
            <AlertActionCloseButton
              onClose={() => {
                setUpdateError(undefined);
              }}
            />
          }
        >
          {updateError.message}
        </Alert>
      )}

      <UpdateStorageMapForm
        storageMap={storageMap}
        targetStorages={targetStorages}
        usedSourceStorages={usedSourceStorages}
        otherSourceStorages={otherSourceStorages}
        isLoading={isLoading}
        loadError={loadError}
        isVsphere={sourceProvider?.spec?.type === PROVIDER_TYPES.vsphere}
        onUpdate={handleUpdate}
        onCancel={handleCancel}
        sourceProvider={sourceProvider}
      />
    </Stack>
  );
};

export default MapsSection;

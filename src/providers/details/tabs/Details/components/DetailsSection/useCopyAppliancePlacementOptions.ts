import { useCallback, useMemo } from 'react';

import type { V1beta1Provider } from '@forklift-ui/types';
import type { SelectOptionProps } from '@patternfly/react-core';
import { useSourceNetworks } from '@utils/hooks/useNetworks';
import useProviderInventory from '@utils/hooks/useProviderInventory';
import { useSourceStorages } from '@utils/hooks/useStorages';
import { useForkliftTranslation } from '@utils/i18n';

import { COPY_APPLIANCE_INVENTORY_ENDPOINTS } from './copyApplianceInventoryConstants';
import type { CopyApplianceSettingField } from './copyAppliancePlacementConfig';
import { toDatastoreSelectOptions, warningForDatastoreName } from './datastoreSelectOptions';
import { toSelectOptions } from './toSelectOptions';

type PathItem = { path?: string };

export const useCopyAppliancePlacementOptions = (
  provider: V1beta1Provider | undefined,
  resourcePool: string,
  includeSelectedResourcePool = true,
): {
  datastoreOptions: SelectOptionProps[];
  datastoreWarning: (name: string) => string | undefined;
  folderOptions: SelectOptionProps[];
  inventoryError: Error | null;
  inventoryErrors: Partial<Record<CopyApplianceSettingField, Error>>;
  inventoryLoading: boolean;
  networkOptions: SelectOptionProps[];
  onRetry: () => void;
  resourcePoolOptions: SelectOptionProps[];
} => {
  const { t } = useForkliftTranslation();
  const [storages, storagesLoading, storagesError, refreshStorages] = useSourceStorages(provider);
  const [networks, networksLoading, networksError, refreshNetworks] = useSourceNetworks(provider);
  const {
    error: foldersError,
    forceRefresh: refreshFolders,
    inventory: folders,
    loading: foldersLoading,
  } = useProviderInventory<PathItem[]>({
    disabled: !provider,
    provider,
    subPath: COPY_APPLIANCE_INVENTORY_ENDPOINTS.folder,
  });
  const {
    error: poolsError,
    forceRefresh: refreshPools,
    inventory: resourcePools,
    loading: poolsLoading,
  } = useProviderInventory<PathItem[]>({
    disabled: !provider,
    provider,
    subPath: COPY_APPLIANCE_INVENTORY_ENDPOINTS.resourcePool,
  });

  const onRetry = useCallback((): void => {
    refreshStorages();
    refreshNetworks();
    refreshFolders();
    refreshPools();
  }, [refreshFolders, refreshNetworks, refreshPools, refreshStorages]);

  const inventoryErrors = useMemo<Partial<Record<CopyApplianceSettingField, Error>>>(
    () => ({
      ...(storagesError ? { datastore: storagesError } : {}),
      ...(foldersError ? { folder: foldersError } : {}),
      ...(networksError ? { network: networksError } : {}),
      ...(poolsError ? { resourcePool: poolsError } : {}),
    }),
    [foldersError, networksError, poolsError, storagesError],
  );
  const datastoreOptions = useMemo(() => toDatastoreSelectOptions(storages, t), [storages, t]);

  const datastoreWarning = useMemo(
    () =>
      (name: string): string | undefined =>
        warningForDatastoreName(storages, name, t),
    [storages, t],
  );

  const folderOptions = useMemo(
    () => toSelectOptions((Array.isArray(folders) ? folders : []).map((item) => item.path ?? '')),
    [folders],
  );
  const networkOptions = useMemo(
    () => toSelectOptions(networks.map((item) => item.name)),
    [networks],
  );
  const resourcePoolOptions = useMemo(() => {
    const paths = (Array.isArray(resourcePools) ? resourcePools : []).map(
      (item) => item.path ?? '',
    );
    if (includeSelectedResourcePool && resourcePool) {
      paths.push(resourcePool);
    }
    return toSelectOptions(paths);
  }, [includeSelectedResourcePool, resourcePools, resourcePool]);

  return {
    datastoreOptions,
    datastoreWarning,
    folderOptions,
    inventoryError: storagesError ?? networksError ?? foldersError ?? poolsError,
    inventoryErrors,
    inventoryLoading: storagesLoading || networksLoading || foldersLoading || poolsLoading,
    networkOptions,
    onRetry,
    resourcePoolOptions,
  };
};

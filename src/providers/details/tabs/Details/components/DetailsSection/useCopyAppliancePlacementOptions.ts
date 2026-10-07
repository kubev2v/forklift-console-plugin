import { useMemo } from 'react';

import type { V1beta1Provider } from '@forklift-ui/types';
import type { SelectOptionProps } from '@patternfly/react-core';
import { useSourceNetworks } from '@utils/hooks/useNetworks';
import useProviderInventory from '@utils/hooks/useProviderInventory';
import { useSourceStorages } from '@utils/hooks/useStorages';
import { useForkliftTranslation } from '@utils/i18n';

import { toDatastoreSelectOptions, warningForDatastoreName } from './datastoreSelectOptions';
import { toSelectOptions } from './toSelectOptions';

type PathItem = { path?: string };

export const useCopyAppliancePlacementOptions = (
  provider: V1beta1Provider,
  resourcePool: string,
): {
  datastoreOptions: SelectOptionProps[];
  datastoreWarning: (name: string) => string | undefined;
  folderOptions: SelectOptionProps[];
  inventoryLoading: boolean;
  networkOptions: SelectOptionProps[];
  resourcePoolOptions: SelectOptionProps[];
} => {
  const { t } = useForkliftTranslation();
  const [storages, storagesLoading] = useSourceStorages(provider);
  const [networks, networksLoading] = useSourceNetworks(provider);
  const { inventory: folders, loading: foldersLoading } = useProviderInventory<PathItem[]>({
    provider,
    subPath: 'folders?detail=1',
  });
  const { inventory: resourcePools, loading: poolsLoading } = useProviderInventory<PathItem[]>({
    provider,
    subPath: 'resourcepools?detail=1',
  });

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
    if (resourcePool) {
      paths.push(resourcePool);
    }
    return toSelectOptions(paths);
  }, [resourcePools, resourcePool]);

  return {
    datastoreOptions,
    datastoreWarning,
    folderOptions,
    inventoryLoading: storagesLoading || networksLoading || foldersLoading || poolsLoading,
    networkOptions,
    resourcePoolOptions,
  };
};

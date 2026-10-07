import { useMemo } from 'react';

import type { V1beta1Provider } from '@forklift-ui/types';
import type { SelectOptionProps } from '@patternfly/react-core';
import { useSourceNetworks } from '@utils/hooks/useNetworks';
import useProviderInventory from '@utils/hooks/useProviderInventory';
import { useSourceStorages } from '@utils/hooks/useStorages';
import { useForkliftTranslation } from '@utils/i18n';

import type { CopyAppliancePlacementFormProps } from './CopyAppliancePlacementForm';
import { toDatastoreSelectOptions, warningForDatastoreName } from './datastoreSelectOptions';

type PathItem = { path?: string };

const toOptions = (values: string[]): SelectOptionProps[] =>
  [...new Set(values.filter(Boolean))]
    .sort((a, b) => a.localeCompare(b))
    .map((value) => ({
      children: value,
      itemId: value,
    }));

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
    () => toOptions((Array.isArray(folders) ? folders : []).map((item) => item.path ?? '')),
    [folders],
  );
  const networkOptions = useMemo(() => toOptions(networks.map((item) => item.name)), [networks]);
  const resourcePoolOptions = useMemo(() => {
    const paths = (Array.isArray(resourcePools) ? resourcePools : []).map(
      (item) => item.path ?? '',
    );
    if (resourcePool) {
      paths.push(resourcePool);
    }
    return toOptions(paths);
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

export const useCopyAppliancePlacementLabels = (): CopyAppliancePlacementFormProps['labels'] => {
  const { t } = useForkliftTranslation();
  return {
    datastore: {
      help: t('Datastore used to store the copy appliance template disk.'),
      label: t('Datastore'),
      placeholder: t('Select a datastore'),
    },
    folder: {
      help: t('Inventory folder path for the copy appliance template VM.'),
      label: t('Folder'),
      placeholder: t('Select a folder'),
    },
    network: {
      help: t('Network attached to the copy appliance template VM.'),
      label: t('Network'),
      placeholder: t('Select a network'),
    },
    resourcePool: {
      help: t('Resource pool for copy appliance clones.'),
      label: t('Resource pool'),
      placeholder: t('Select a resource pool'),
    },
  };
};

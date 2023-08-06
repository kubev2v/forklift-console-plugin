import * as React from 'react';
import { usePollingContext } from 'legacy/src/common/context';
import { useMockableQuery, sortByName, getInventoryApiUrl } from './helpers';
import {
  IAnnotatedStorageClass,
  IByProvider,
  IOpenShiftProvider,
  IStorageClass,
  MappingType,
  ISourceStorage,
  SourceInventoryProvider,
} from './types';
import {
  MOCK_VMWARE_DATASTORES,
  MOCK_RHV_STORAGE_DOMAINS,
  MOCK_OPENSTACK_VOLUME_TYPES,
} from './mocks/storages.mock';
import { MOCK_STORAGE_CLASSES_BY_PROVIDER } from './mocks/storages.mock';
import { consoleFetchJSON } from '@openshift-console/dynamic-plugin-sdk';

export const useSourceStoragesQuery = (
  provider: SourceInventoryProvider | null,
  mappingType: MappingType
) => {
  const apiSlug = (provider: SourceInventoryProvider) => {
    if (provider?.type === 'vsphere') {
      return '/datastores';
    }
    if (provider?.type === 'openstack') {
      return '/volumetypes';
    }
    if (provider?.type === 'openshift') {
      return '/storageclasses?detail=1';
    }
    if (provider?.type === 'ova') {
      return '/storages?detail=1';
    }
    return '/storagedomains';
  };
  const mockStorage = (provider: SourceInventoryProvider) => {
    if (provider?.type === 'vsphere') {
      return MOCK_VMWARE_DATASTORES;
    }
    if (provider?.type === 'openstack') {
      return MOCK_OPENSTACK_VOLUME_TYPES;
    }
    return MOCK_RHV_STORAGE_DOMAINS;
  };
  const sortByNameCallback = React.useCallback((data): ISourceStorage[] => sortByName(data), []);
  const result = useMockableQuery<ISourceStorage[]>(
    {
      queryKey: ['source-storages', provider?.name],
      queryFn: async () =>
        await consoleFetchJSON(
          getInventoryApiUrl(`${provider?.selfLink || ''}${apiSlug(provider)}`)
        ),
      enabled: !!provider && mappingType === MappingType.Storage,
      refetchInterval: usePollingContext().refetchInterval,
      select: sortByNameCallback,
    },
    mockStorage(provider)
  );
  return result;
};

const annotateStorageClasses = (storageClasses: IStorageClass[]): IAnnotatedStorageClass[] =>
  storageClasses
    .map((storageClass) => ({
      ...storageClass,
      uiMeta: {
        isDefault:
          storageClass.object.metadata.annotations?.[
            'storageclass.kubernetes.io/is-default-class'
          ] === 'true',
      },
    }))
    .sort((a, b) => {
      // Always put the default at the top
      if (a.uiMeta.isDefault && !b.uiMeta.isDefault) return -1;
      if (b.uiMeta.isDefault && !a.uiMeta.isDefault) return 1;
      return 0;
    });

export const useStorageClassesQuery = (
  providers: (IOpenShiftProvider | null)[] | null,
  mappingType: MappingType
) => {
  const definedProviders = providers
    ? (providers.filter((provider) => !!provider) as IOpenShiftProvider[])
    : [];
  const result = useMockableQuery<IByProvider<IAnnotatedStorageClass>>(
    {
      // Key by the provider names combined, so it refetches if the list of providers changes
      queryKey: ['storageClasses', ...definedProviders.map((provider) => provider.name)],
      // Fetch multiple resources in one query via Promise.all()
      queryFn: async () => {
        const storageClassLists: IStorageClass[][] = await Promise.all(
          (providers || []).map((provider) =>
            consoleFetchJSON(
              getInventoryApiUrl(`${provider?.selfLink || ''}/storageclasses?detail=1`)
            )
          )
        );
        return definedProviders.reduce(
          (newObj, provider, index) => ({
            ...newObj,
            [provider.name]: annotateStorageClasses(storageClassLists[index]),
          }),
          {} as IByProvider<IAnnotatedStorageClass>
        );
      },
      enabled: !!providers && providers.length > 0 && mappingType === MappingType.Storage,
      refetchInterval: usePollingContext().refetchInterval,
    },
    MOCK_STORAGE_CLASSES_BY_PROVIDER
  );
  return result;
};

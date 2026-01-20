import { useMemo } from 'react';
import { STORAGE_NAMES } from 'src/storageMaps/utils/constants';

import type {
  OpenShiftStorageClass,
  OpenstackVolumeType,
  OVirtStorageDomain,
  ProviderType,
  TypedOvaResource,
  V1beta1Provider,
  VSphereDataStore,
} from '@kubev2v/types';

import useProviderInventory from './useProviderInventory';

const glanceStorage: InventoryStorage = {
  description: '',
  id: STORAGE_NAMES.GLANCE,
  isPublic: true,
  name: STORAGE_NAMES.GLANCE,
  providerType: 'openstack',
  publicAccess: true,
  qosSpecsID: '',
  revision: 1,
  selfLink: '',
};

const subPath: Record<ProviderType, string> = {
  openshift: 'storageclasses?detail=1',
  openstack: 'volumetypes',
  ova: 'storages?detail=1',
  ovirt: 'storagedomains',
  vsphere: 'datastores',
};

export type InventoryStorage =
  | VSphereDataStore
  | OVirtStorageDomain
  | OpenstackVolumeType
  | OpenShiftStorageClass
  | TypedOvaResource;

export const useSourceStorages = (
  provider: V1beta1Provider | undefined,
): [InventoryStorage[], boolean, Error | null] => {
  const providerType: ProviderType = provider?.spec?.type as ProviderType;
  const {
    error,
    inventory: storages,
    loading,
  } = useProviderInventory<InventoryStorage[]>({
    disabled: !provider || !subPath[providerType],
    provider,
    subPath: subPath[providerType] ?? '',
  });

  const typedStorages = useMemo(() => {
    const storageList = Array.isArray(storages)
      ? storages.map((st) => ({ ...st, providerType }) as InventoryStorage)
      : [];

    if (Array.isArray(storages) && providerType === 'openstack') {
      storageList.push(glanceStorage);
    }

    return storageList;
  }, [providerType, storages]);

  return [typedStorages, loading, error];
};

export const useOpenShiftStorages = (
  provider: V1beta1Provider | undefined,
): [OpenShiftStorageClass[], boolean, Error | null] => {
  const providerType: ProviderType = provider?.spec?.type as ProviderType;
  const {
    error,
    inventory: storages,
    loading,
  } = useProviderInventory<OpenShiftStorageClass[]>({
    disabled: !provider || providerType !== 'openshift',
    provider,
    subPath: 'storageclasses?detail=1',
  });

  const typedStorages = useMemo(
    () =>
      Array.isArray(storages)
        ? storages.map((st) => ({ ...st, providerType: 'openshift' }) as OpenShiftStorageClass)
        : [],
    [storages],
  );

  return [typedStorages, loading, error];
};

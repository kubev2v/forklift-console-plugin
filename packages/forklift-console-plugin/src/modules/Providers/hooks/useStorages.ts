import { useMemo } from 'react';

import {
  OpenShiftStorageClass,
  OpenstackVolumeType,
  OVirtStorageDomain,
  ProviderType,
  V1beta1Provider,
  VSphereDataStore,
} from '@kubev2v/types';
import { TypedOvaResource } from '@kubev2v/types/dist/types/provider/ova/TypedResource';

import useProviderInventory from './useProviderInventory';

const subPath: { [keys in ProviderType]: string } = {
  vsphere: '/datastores',
  openstack: '/volumetypes',
  openshift: '/storageclasses?detail=1',
  ova: '/storages?detail=1',
  ovirt: '/storagedomains',
};

export type InventoryStorage =
  | VSphereDataStore
  | OVirtStorageDomain
  | OpenstackVolumeType
  | OpenShiftStorageClass
  | TypedOvaResource;

export const useSourceStorages = (
  provider: V1beta1Provider,
): [InventoryStorage[], boolean, Error] => {
  const providerType: ProviderType = provider?.spec?.type as ProviderType;
  const {
    inventory: storages,
    loading,
    error,
  } = useProviderInventory<InventoryStorage[]>({
    provider,
    subPath: subPath[providerType] ?? '',
    disabled: !provider || !subPath[providerType],
  });

  const typedStorages = useMemo(
    () =>
      Array.isArray(storages)
        ? storages.map((st) => ({ ...st, providerType } as InventoryStorage))
        : [],
    [storages],
  );

  return [typedStorages, loading, error];
};

export const useOpenShiftStorages = (
  provider: V1beta1Provider,
): [OpenShiftStorageClass[], boolean, Error] => {
  const providerType: ProviderType = provider?.spec?.type as ProviderType;
  const {
    inventory: storages,
    loading,
    error,
  } = useProviderInventory<OpenShiftStorageClass[]>({
    provider,
    subPath: '/storageclasses?detail=1',
    disabled: !provider || providerType !== 'openshift',
  });

  const typedStorages = useMemo(
    () =>
      Array.isArray(storages)
        ? storages.map((st) => ({ ...st, providerType: 'openshift' } as OpenShiftStorageClass))
        : [],
    [storages],
  );

  return [typedStorages, loading, error];
};

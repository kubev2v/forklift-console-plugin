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

const apiSlug = (providerType: ProviderType): string => {
  switch (providerType) {
    case 'vsphere':
      return '/datastores';
    case 'openstack':
      return '/volumetypes';
    case 'openshift':
      return '/storageclasses?detail=1';
    case 'ova':
      return '/storages?detail=1';
    case 'ovirt':
      return '/storagedomains';
    default:
      return '';
  }
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
    subPath: apiSlug(providerType),
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
    subPath: apiSlug(providerType),
  });

  const typedStorages = useMemo(
    () =>
      Array.isArray(storages) && providerType === 'openshift'
        ? storages.map((st) => ({ ...st, providerType } as OpenShiftStorageClass))
        : [],
    [storages],
  );

  return [typedStorages, loading, error];
};

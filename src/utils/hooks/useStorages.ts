import { useMemo } from 'react';
import { PROVIDER_TYPES } from 'src/providers/utils/constants';

import type {
  OpenShiftStorageClass,
  OpenstackVolumeType,
  OVirtStorageDomain,
  ProviderType,
  TypedOvaResource,
  V1beta1Provider,
  VSphereDataStore,
} from '@forklift-ui/types';
import { STORAGE_NAMES } from '@utils/constants';
import type { Ec2Storage } from '@utils/types/ec2Inventory';

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

const subPath: Record<string, string> = {
  [PROVIDER_TYPES.ec2]: 'storages',
  [PROVIDER_TYPES.hyperv]: 'storages?detail=1',
  [PROVIDER_TYPES.openshift]: 'storageclasses?detail=1',
  [PROVIDER_TYPES.openstack]: 'volumetypes',
  [PROVIDER_TYPES.ova]: 'storages?detail=1',
  [PROVIDER_TYPES.ovirt]: 'storagedomains',
  [PROVIDER_TYPES.vsphere]: 'datastores',
};

export type InventoryStorage =
  | VSphereDataStore
  | OVirtStorageDomain
  | OpenstackVolumeType
  | OpenShiftStorageClass
  | TypedOvaResource
  | Ec2Storage;

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

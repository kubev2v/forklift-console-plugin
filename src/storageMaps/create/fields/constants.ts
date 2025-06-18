import { t } from '@utils/i18n';

import type { MappingValue } from './types';

export enum CreateStorageMapFieldId {
  MapName = 'mapName',
  Project = 'project',
  StorageMap = 'storageMap',
  SourceProvider = 'sourceProvider',
  TargetProvider = 'targetProvider',
  SourceStorage = 'sourceStorage',
  TargetStorage = 'targetStorage',
  OffloadPlugin = 'copyOffloadPlugin',
  StorageSecret = 'storageSecret',
  StorageProduct = 'storageProduct',
}

export type StorageMapping = {
  [CreateStorageMapFieldId.SourceStorage]: MappingValue;
  [CreateStorageMapFieldId.TargetStorage]: MappingValue;
  [CreateStorageMapFieldId.OffloadPlugin]?: string;
  [CreateStorageMapFieldId.StorageSecret]?: string;
  [CreateStorageMapFieldId.StorageProduct]?: string;
};

export const defaultStorageMapping: StorageMapping = {
  [CreateStorageMapFieldId.OffloadPlugin]: '',
  [CreateStorageMapFieldId.SourceStorage]: { name: '' },
  [CreateStorageMapFieldId.StorageProduct]: '',
  [CreateStorageMapFieldId.StorageSecret]: '',
  [CreateStorageMapFieldId.TargetStorage]: { name: '' },
};

export const createStorageMapFieldLabels: Partial<
  Record<CreateStorageMapFieldId, ReturnType<typeof t>>
> = {
  [CreateStorageMapFieldId.MapName]: t('Map name'),
  [CreateStorageMapFieldId.OffloadPlugin]: t('Offload plugin'),
  [CreateStorageMapFieldId.Project]: t('Project'),
  [CreateStorageMapFieldId.SourceProvider]: t('Source provider'),
  [CreateStorageMapFieldId.SourceStorage]: t('Source storage'),
  [CreateStorageMapFieldId.StorageProduct]: t('Storage product'),
  [CreateStorageMapFieldId.StorageSecret]: t('Storage secret'),
  [CreateStorageMapFieldId.TargetProvider]: t('Target provider'),
  [CreateStorageMapFieldId.TargetStorage]: t('Target storage'),
};

export enum OffloadPlugin {
  VSphereXcopyConfig = 'vsphereXcopyConfig',
}

// Reference: https://github.com/kubev2v/forklift/blob/29b60e21c388420e6e0e79a55802c2c0a201ab45/pkg/apis/forklift/v1beta1/mapping.go
enum StorageVendorProduct {
  Vantara = 'vantara',
  Ontap = 'ontap',
  Primera3Par = 'primera3par',
}

export const offloadPluginLabels: Record<OffloadPlugin, ReturnType<typeof t>> = {
  [OffloadPlugin.VSphereXcopyConfig]: t('vSphere XCOPY'),
};

export const storageVendorProductLabels: Record<StorageVendorProduct, ReturnType<typeof t>> = {
  [StorageVendorProduct.Ontap]: t('NetApp ONTAP'),
  [StorageVendorProduct.Primera3Par]: t('HPE Primera/3PAR'),
  [StorageVendorProduct.Vantara]: t('Hitachi Vantara'),
};

export const offloadPlugins = Object.values(OffloadPlugin);
export const storageVendorProducts = Object.values(StorageVendorProduct);

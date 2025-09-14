import type { StorageMappingValue } from 'src/storageMaps/types';

import { t } from '@utils/i18n';

export enum StorageMapFieldId {
  MapName = 'mapName',
  Project = 'project',
  StorageMap = 'storageMap',
  SourceProvider = 'sourceProvider',
  TargetProvider = 'targetProvider',
  SourceStorage = 'sourceStorage',
  TargetStorage = 'targetStorage',
  OffloadPlugin = 'offloadPlugin',
  StorageSecret = 'storageSecret',
  StorageProduct = 'storageProduct',
}

export type StorageMapping = {
  [StorageMapFieldId.SourceStorage]: StorageMappingValue;
  [StorageMapFieldId.TargetStorage]: StorageMappingValue;
  [StorageMapFieldId.OffloadPlugin]?: string;
  [StorageMapFieldId.StorageSecret]?: string;
  [StorageMapFieldId.StorageProduct]?: string;
};

export const defaultStorageMapping: StorageMapping = {
  [StorageMapFieldId.OffloadPlugin]: '',
  [StorageMapFieldId.SourceStorage]: { name: '' },
  [StorageMapFieldId.StorageProduct]: '',
  [StorageMapFieldId.StorageSecret]: '',
  [StorageMapFieldId.TargetStorage]: { name: '' },
};

export const storageMapFieldLabels: Partial<Record<StorageMapFieldId, ReturnType<typeof t>>> = {
  [StorageMapFieldId.MapName]: t('Map name'),
  [StorageMapFieldId.OffloadPlugin]: t('Offload plugin'),
  [StorageMapFieldId.Project]: t('Project'),
  [StorageMapFieldId.SourceProvider]: t('Source provider'),
  [StorageMapFieldId.SourceStorage]: t('Source storage'),
  [StorageMapFieldId.StorageProduct]: t('Storage product'),
  [StorageMapFieldId.StorageSecret]: t('Storage secret'),
  [StorageMapFieldId.TargetProvider]: t('Target provider'),
  [StorageMapFieldId.TargetStorage]: t('Target storage'),
};

export enum OffloadPlugin {
  VSphereXcopyConfig = 'vsphereXcopyConfig',
}

// Reference: https://github.com/kubev2v/forklift/blob/29b60e21c388420e6e0e79a55802c2c0a201ab45/pkg/apis/forklift/v1beta1/mapping.go
export enum StorageVendorProduct {
  Vantara = 'vantara',
  Ontap = 'ontap',
  Primera3Par = 'primera3par',
  PowerFlex = 'powerflex',
  PowerMax = 'powermax',
  PureFlashArray = 'pureFlashArray',
}

export const offloadPluginLabels: Record<OffloadPlugin, ReturnType<typeof t>> = {
  [OffloadPlugin.VSphereXcopyConfig]: t('vSphere XCOPY'),
};

export const storageVendorProductLabels: Record<StorageVendorProduct, ReturnType<typeof t>> = {
  [StorageVendorProduct.Ontap]: t('NetApp ONTAP'),
  [StorageVendorProduct.PowerFlex]: t('Dell PowerFlex'),
  [StorageVendorProduct.PowerMax]: t('Dell PowerMax'),
  [StorageVendorProduct.Primera3Par]: t('HPE Primera/3PAR'),
  [StorageVendorProduct.PureFlashArray]: t('Pure Storage FlashArray'),
  [StorageVendorProduct.Vantara]: t('Hitachi Vantara'),
};

export const offloadPlugins = Object.values(OffloadPlugin);
export const storageVendorProducts = Object.values(StorageVendorProduct);

export const STORAGE_NAMES = {
  GLANCE: 'glance',
};

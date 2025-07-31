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

export const offloadPluginLabels: Record<OffloadPlugin, ReturnType<typeof t>> = {
  [OffloadPlugin.VSphereXcopyConfig]: t('vSphere XCOPY'),
};

export const offloadPlugins = Object.values(OffloadPlugin);

export const STORAGE_NAMES = {
  GLANCE: 'glance',
};

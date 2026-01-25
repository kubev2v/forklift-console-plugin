import type { FieldValues } from 'react-hook-form';

import type { V1beta1Provider, V1beta1StorageMapSpecMap } from '@forklift-ui/types';

import type { StorageMapFieldId, StorageMapping } from '../utils/types';

export type CreateStorageMapFormData = FieldValues & {
  [StorageMapFieldId.MapName]: string;
  [StorageMapFieldId.Project]: string;
  [StorageMapFieldId.SourceProvider]: V1beta1Provider | undefined;
  [StorageMapFieldId.TargetProvider]: V1beta1Provider | undefined;
  [StorageMapFieldId.StorageMap]: StorageMapping[];
};

type VSphereXcopyConfig = {
  secretRef: string;
  storageVendorProduct: string;
};

export type OffloadPluginConfig = {
  vsphereXcopyConfig: VSphereXcopyConfig;
};

export type CustomStorageMapSpecMap = Omit<V1beta1StorageMapSpecMap, 'offloadPlugin'> & {
  offloadPlugin?: OffloadPluginConfig;
};

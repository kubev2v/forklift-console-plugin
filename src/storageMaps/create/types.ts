import type { FieldValues } from 'react-hook-form';

import type {
  K8sIoApiCoreV1LocalObjectReference,
  V1beta1Provider,
  V1beta1StorageMapSpecMap,
} from '@kubev2v/types';

import type { CreateStorageMapFieldId, StorageMapping } from './fields/constants';

export type CreateStorageMapFormData = FieldValues & {
  [CreateStorageMapFieldId.MapName]: string;
  [CreateStorageMapFieldId.Project]: string;
  [CreateStorageMapFieldId.SourceProvider]: V1beta1Provider | undefined;
  [CreateStorageMapFieldId.TargetProvider]: V1beta1Provider | undefined;
  [CreateStorageMapFieldId.StorageMap]: StorageMapping[];
};

type VSphereXcopyConfig = {
  secretRef: K8sIoApiCoreV1LocalObjectReference;
  storageVendorProduct: string;
};

export type OffloadPluginConfig = {
  vsphereXcopyConfig: VSphereXcopyConfig;
};

export type CustomStorageMapSpecMap = V1beta1StorageMapSpecMap & {
  offloadPlugin?: OffloadPluginConfig;
};

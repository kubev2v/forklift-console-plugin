import { IoK8sApiStorageV1StorageClass } from '../../k8s/IoK8sApiStorageV1StorageClass';

import { Resource } from './Resource';

// https://github.com/kubev2v/forklift/tree/main/pkg/controller/provider/web/ocp/storageclass.go
export interface StorageClass extends Resource {
  // Object storage.StorageClass `json:"object"`
  object: IoK8sApiStorageV1StorageClass;
}

export type OpenShiftStorageClass = StorageClass;

import { IoK8sApiStorageV1StorageClass } from '../../../generated';

import { TypedOpenshiftResource } from './TypedResource';

// https://github.com/kubev2v/forklift/tree/main/pkg/controller/provider/web/ocp/storageclass.go
export interface OpenShiftStorageClass extends TypedOpenshiftResource {
  // Object storage.StorageClass `json:"object"`
  object: IoK8sApiStorageV1StorageClass;
}

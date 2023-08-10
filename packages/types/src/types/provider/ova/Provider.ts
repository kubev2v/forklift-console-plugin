import { V1beta1Provider } from '../../../models';
import { OpenshiftResource } from '../openshift/Resource';

// https://github.com/kubev2v/forklift/tree/main/pkg/controller/provider/web/ova/provider.go
export interface OvaProvider extends OpenshiftResource {
  // Type            string       `json:"type"`
  type: string;
  // Object          api.Provider `json:"object"`
  object: V1beta1Provider;
  // APIVersion      string       `json:"apiVersion"`
  apiVersion: string;
  // Product         string       `json:"product"`
  product: string;
  // VMCount         int64        `json:"vmCount"`
  vmCount: number;
  // NetworkCount    int64        `json:"networkCount"`
  networkCount: number;
  // DatastoreCount  int64        `json:"datastoreCount"`
  DiskCount: number;
  // StorageCount  int64        `json:"storageCount"`
  storageCount: number;
}

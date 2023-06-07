import { V1beta1Provider } from '../../../models';
import { OpenshiftResource } from '../openshift/Resource';

// https://github.com/kubev2v/forklift/tree/main/pkg/controller/provider/web/vsphere/provider.go
export interface VSphereProvider extends OpenshiftResource {
  // Type            string       `json:"type"`
  type: string;
  // Object          api.Provider `json:"object"`
  object: V1beta1Provider;
  // APIVersion      string       `json:"apiVersion"`
  apiVersion: string;
  // Product         string       `json:"product"`
  product: string;
  // DatacenterCount int64        `json:"datacenterCount"`
  datacenterCount: number;
  // ClusterCount    int64        `json:"clusterCount"`
  clusterCount: number;
  // HostCount       int64        `json:"hostCount"`
  hostCount: number;
  // VMCount         int64        `json:"vmCount"`
  vmCount: number;
  // NetworkCount    int64        `json:"networkCount"`
  networkCount: number;
  // DatastoreCount  int64        `json:"datastoreCount"`
  datastoreCount: number;
}

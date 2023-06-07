import { V1beta1Provider } from '../../../models';
import { OpenshiftResource } from '../openshift/Resource';

// https://github.com/kubev2v/forklift/tree/main/pkg/controller/provider/web/openstack/provider.go
export interface OpenstackProvider extends OpenshiftResource {
  // Type            string       `json:"type"`
  type: string;
  // Object          api.Provider `json:"object"`
  object: V1beta1Provider;
  // RegionCount     int64        `json:"regionCount"`
  regionCount: number;
  // ProjectCount    int64        `json:"projectCount"`
  projectCount: number;
  // VMCount         int64        `json:"vmCount"`
  vmCount: number;
  // ImageCount      int64        `json:"imageCount"`
  imageCount: number;
  // VolumeCount     int64        `json:"volumeCount"`
  volumeCount: number;
  // VolumeTypeCount int64        `json:"volumeTypeCount"`
  volumeTypeCount: number;
  // NetworkCount    int64        `json:"networkCount"`
  networkCount: number;
}

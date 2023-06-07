import { V1beta1Provider } from '../../../models';

import { OpenshiftResource } from './Resource';

// https://github.com/kubev2v/forklift/tree/main/pkg/controller/provider/web/ocp/provider.go
export interface OpenshiftProvider extends OpenshiftResource {
  // Type              string       `json:"type"`
  type: string;
  // Object            api.Provider `json:"object"`
  object: V1beta1Provider;
  // VMCount           int64        `json:"vmCount"`
  vmCount: number;
  // NetworkCount      int64        `json:"networkCount"`
  networkCount: number;
  // StorageClassCount int64        `json:"storageClassCount"`
  storageClassCount: number;
}

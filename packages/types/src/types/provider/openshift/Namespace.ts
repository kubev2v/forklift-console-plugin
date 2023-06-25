import { V1Namespace } from '../../k8s/V1Namespace';

import { OpenshiftResource } from './Resource';

// https://github.com/kubev2v/forklift/tree/main/pkg/controller/provider/web/ocp/namespace.go
export interface OpenShiftNamespace extends OpenshiftResource {
  // Object core.Namespace `json:"object"`
  object: V1Namespace;
}

import { V1Namespace } from '../../k8s/Namespace';

import { Resource } from './Resource';

// https://github.com/kubev2v/forklift/tree/main/pkg/controller/provider/web/ocp/namespace.go
export interface Namespace extends Resource {
  // Object core.Namespace `json:"object"`
  object: V1Namespace;
}

export type OpenShiftNamespace = Resource;

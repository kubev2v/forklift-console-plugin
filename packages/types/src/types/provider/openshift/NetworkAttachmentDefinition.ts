import { V1NetworkAttachmentDefinition } from '../../k8s';

import { TypedOpenshiftResource } from './TypedResource';

// https://github.com/kubev2v/forklift/tree/main/pkg/controller/provider/web/ocp/netattachdefinition.go
export interface OpenShiftNetworkAttachmentDefinition extends TypedOpenshiftResource {
  // Object net.NetworkAttachmentDefinition `json:"object"`
  object: V1NetworkAttachmentDefinition;
}

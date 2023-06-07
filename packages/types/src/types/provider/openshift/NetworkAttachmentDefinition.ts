import { V1NetworkAttachmentDefinition } from '../../k8s/V1NetworkAttachmentDefinition';

import { OpenshiftResource } from './Resource';

// https://github.com/kubev2v/forklift/tree/main/pkg/controller/provider/web/ocp/netattachdefinition.go
export interface OpenShiftNetworkAttachmentDefinition extends OpenshiftResource {
  // Object net.NetworkAttachmentDefinition `json:"object"`
  object: V1NetworkAttachmentDefinition;
}

import { V1NetworkAttachmentDefinition } from '../../k8s/NetworkAttachementDefinition';

import { Resource } from './Resource';

// https://github.com/kubev2v/forklift/tree/main/pkg/controller/provider/web/ocp/netattachdefinition.go
export interface NetworkAttachmentDefinition extends Resource {
  // Object net.NetworkAttachmentDefinition `json:"object"`
  object: V1NetworkAttachmentDefinition;
}

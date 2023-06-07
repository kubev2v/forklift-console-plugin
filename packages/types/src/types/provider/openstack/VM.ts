import { Concern } from '../base/model';

import { OpenstackResource } from './Resource';

// https://github.com/kubev2v/forklift/tree/main/pkg/controller/provider/web/openstack/vm.go
export interface OpenstackVM extends OpenstackResource {
  // TenantID          string                 `json:"tenantID"`
  tenantID: string;
  // 'ACTIVE' | 'SHUTOFF' | 'PAUSED' | 'SHELVED_OFFLOADED' | 'SUSPENDED'
  // Status            string                 `json:"status"`
  status: string;
  // HostID            string                 `json:"hostID,omitempty"`
  hostID?: string;
  // RevisionValidated int64                  `json:"revisionValidated"`
  revisionValidated: number;
  // ImageID           string                 `json:"imageID,omitempty"`
  imageID?: string;
  // FlavorID          string                 `json:"flavorID"`
  flavorID: string;
  // Addresses         map[string]interface{} `json:"addresses"`
  addresses: { [key: string]: any };
  // AttachedVolumes   []AttachedVolume       `json:"attachedVolumes,omitempty"`
  attachedVolumes?: OpenstackAttachedVolume[];
  // Concerns          []Concern              `json:"concerns"`
  concerns: Concern[];
}

export interface OpenstackAttachedVolume {
  ID: string;
}

import { Concern } from '../base/model';

import { OVirtDiskAttachment, OVirtNIC } from './model';
import { OVirtResource } from './Resource';

// https://github.com/kubev2v/forklift/tree/main/pkg/controller/provider/web/ovirt/vm.go
export interface OVirtVM extends OVirtResource {
  // Cluster           string           `json:"cluster"`
  cluster: string;
  // 'up' | 'down'
  // Status            string           `json:"status"`
  status: string;
  // Host              string           `json:"host"`
  host: string;
  // RevisionValidated int64            `json:"revisionValidated"`
  revisionValidated: number;
  // NICs              []OVirtNIC           `json:"nics"`
  nics: OVirtNIC[];
  // DiskAttachments   []DiskAttachment `json:"diskAttachments"`
  diskAttachments: OVirtDiskAttachment[];
  // Concerns          []Concern        `json:"concerns"`
  concerns: Concern[];
}

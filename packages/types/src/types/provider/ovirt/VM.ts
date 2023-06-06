import { Concern } from '../base/model';

import { DiskAttachment, NIC } from './model';
import { Resource } from './Resource';

// https://github.com/kubev2v/forklift/tree/main/pkg/controller/provider/web/ovirt/vm.go
export interface VM extends Resource {
  // Cluster           string           `json:"cluster"`
  cluster: string;
  // 'up' | 'down'
  // Status            string           `json:"status"`
  status: string;
  // Host              string           `json:"host"`
  host: string;
  // RevisionValidated int64            `json:"revisionValidated"`
  revisionValidated: number;
  // NICs              []VNIC           `json:"nics"`
  nics: NIC[];
  // DiskAttachments   []DiskAttachment `json:"diskAttachments"`
  diskAttachments: DiskAttachment[];
  // Concerns          []Concern        `json:"concerns"`
  concerns: Concern[];
}

export type RHVVM = VM;

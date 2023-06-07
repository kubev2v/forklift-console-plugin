import { Concern, Ref } from '../base/model';

import { VSphereDisk } from './model';
import { VSphereResource } from './Resource';

// https://github.com/kubev2v/forklift/tree/main/pkg/controller/provider/web/vsphere/vm.go
export interface VSphereVM extends VSphereResource {
  // RevisionValidated int64           `json:"revisionValidated"`
  revisionValidated: number;
  // IsTemplate        bool            `json:"isTemplate"`
  isTemplate: boolean;
  // 'poweredOff' | 'poweredOn'
  // PowerState        string          `json:"powerState"`
  powerState: string;
  // Host              string          `json:"host"`
  host: string;
  // Networks          []model.Ref     `json:"networks"`
  networks: Ref[];
  // Disks             []model.Disk    `json:"disks"`
  disks: VSphereDisk[];
  // Concerns          []model.Concern `json:"concerns"`
  concerns: Concern[];
}

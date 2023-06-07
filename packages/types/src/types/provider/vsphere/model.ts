import { Ref } from '../base/model';

// https://github.com/kubev2v/forklift/tree/main/pkg/controller/provider/model/vsphere/model.go
export interface VSphereDVSHost {
  // Host Ref
  host: Ref;
  // PNIC []string
  pnic: string[];
}

// Virtual Disk.
export interface VSphereDisk {
  // Key       int32  `json:"key"`
  key: number;
  // File      string `json:"file"`
  file: string;
  // Datastore Ref    `json:"datastore"`
  datastore: Ref;
  // Capacity  int64  `json:"capacity"`
  capacity: number;
  // Shared    bool   `json:"shared"`
  shared: boolean;
  // RDM       bool   `json:"rdm"`
  rdm: boolean;
}

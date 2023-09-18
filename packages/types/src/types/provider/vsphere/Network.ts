import { Ref } from '../base/model';

import { VSphereDVSHost } from './model';
import { TypedVSphereResource } from './TypedResource';

// https://github.com/kubev2v/forklift/tree/main/pkg/controller/provider/web/vsphere/network.go
export interface VSphereNetwork extends TypedVSphereResource {
  // Variant  string          `json:"variant"`
  variant: string;
  // DVSwitch *model.Ref      `json:"dvSwitch,omitempty"`
  dvSwitch?: Ref;
  // Host     []model.DVSHost `json:"host"`
  host: VSphereDVSHost[];
  // Tag      string          `json:"tag,omitempty"`
  tag?: string;
  // Key      string          `json:"key,omitempty"`
  key?: string;
}

import { Ref } from '../base/model';

import { DVSHost } from './model';
import { Resource } from './Resource';

// https://github.com/kubev2v/forklift/tree/main/pkg/controller/provider/web/vsphere/network.go
export interface Network extends Resource {
  // Variant  string          `json:"variant"`
  variant: string;
  // DVSwitch *model.Ref      `json:"dvSwitch,omitempty"`
  dvSwitch?: Ref;
  // Host     []model.DVSHost `json:"host"`
  host: DVSHost[];
  // Tag      string          `json:"tag,omitempty"`
  tag?: string;
  // Key      string          `json:"key,omitempty"`
  key?: string;
}

// to do: confirm on real data that "parent" can be omitted
export type VmWareNetwork = Omit<Resource, 'parent'>;

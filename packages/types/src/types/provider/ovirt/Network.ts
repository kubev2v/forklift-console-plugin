import { Resource } from './Resource';

// https://github.com/kubev2v/forklift/tree/main/pkg/controller/provider/web/ovirt/network.go
export interface Network extends Resource {
  // DataCenter string   `json:"dataCenter"`
  dataCenter: string;
  // VLan       string   `json:"vlan"`
  vlan: string;
  // Usages     []string `json:"usages"`
  usages: string[];
  // Profiles   []string `json:"nicProfiles"`
  nicProfiles: string[];
}

export type OvirtNetwork = Resource;

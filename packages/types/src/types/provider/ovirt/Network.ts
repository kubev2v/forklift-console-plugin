import { OVirtResource } from './Resource';

// https://github.com/kubev2v/forklift/tree/main/pkg/controller/provider/web/ovirt/network.go
export interface OVirtNetwork extends OVirtResource {
  // DataCenter string   `json:"dataCenter"`
  dataCenter: string;
  // VLan       string   `json:"vlan"`
  vlan: string;
  // Usages     []string `json:"usages"`
  usages: string[];
  // Profiles   []string `json:"nicProfiles"`
  nicProfiles: string[];
}

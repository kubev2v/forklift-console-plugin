import { TypedOVirtResource } from './TypedResource';

// https://github.com/kubev2v/forklift/tree/main/pkg/controller/provider/web/ovirt/network.go
export interface OVirtNetwork extends TypedOVirtResource {
  // DataCenter string   `json:"dataCenter"`
  dataCenter: string;
  // VLan       string   `json:"vlan"`
  vlan: string;
  // Usages     []string `json:"usages"`
  usages: string[];
  // Profiles   []string `json:"nicProfiles"`
  nicProfiles: string[];
}

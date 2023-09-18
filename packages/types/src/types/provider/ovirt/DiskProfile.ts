import { TypedOVirtResource } from './TypedResource';

// https://github.com/kubev2v/forklift/tree/main/pkg/controller/provider/web/ovirt/diskprofile.go
export interface OVirtDiskProfile extends TypedOVirtResource {
  // StorageDomain string `json:"storageDomain"`
  storageDomain: string;
  // QoS           string `json:"qos"`
  qos: string;
}

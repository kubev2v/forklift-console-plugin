import { Resource } from './Resource';

// https://github.com/kubev2v/forklift/tree/main/pkg/controller/provider/web/ovirt/diskprofile.go
export interface DiskProfile extends Resource {
  // StorageDomain string `json:"storageDomain"`
  storageDomain: string;
  // QoS           string `json:"qos"`
  qos: string;
}

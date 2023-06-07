import { OVirtResource } from './Resource';

// https://github.com/kubev2v/forklift/tree/main/pkg/controller/provider/web/ovirt/disk.go
export interface OVirtDisk extends OVirtResource {
  // Shared          bool   `json:"shared"`
  shared: boolean;
  // StorageDomain   string `json:"storageDomain"`
  storageDomain: string;
  // Profile         string `json:"profile"`
  profile: string;
  // ProvisionedSize int64  `json:"provisionedSize"`
  provisionedSize: number;
  // ActualSize      int64  `json:"actualSize"`
  actualSize: number;
  // StorageType     string `json:"storageType"`
  storageType: string;
  // Status          string `json:"status"`
  status: string;
}

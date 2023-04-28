import { Resource } from './Resource';

// https://github.com/kubev2v/forklift/tree/main/pkg/controller/provider/web/ovirt/storage.go
export interface StorageDomain extends Resource {
  // DataCenter string `json:"dataCenter"`
  dataCenter: string;
  // Type       string `json:"type"`
  type: string;
  // Capacity   int64  `json:"capacity"`
  capacity: number;
  // Free       int64  `json:"free"`
  free: number;
  // Storage    struct {
  // 	Type string `json:"type"`
  // } `json:"storage"`
  storage: { type: string };
}

export type OVirtStorageDomain = Resource;

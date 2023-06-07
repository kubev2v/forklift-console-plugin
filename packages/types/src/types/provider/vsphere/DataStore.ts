import { VSphereResource } from './Resource';

// https://github.com/kubev2v/forklift/tree/main/pkg/controller/provider/web/vsphere/datastore.go
export interface VSphereDataStore extends VSphereResource {
  // Type            string `json:"type"`
  type: string;
  // Capacity        int64  `json:"capacity"`
  capacity: number;
  // Free            int64  `json:"free"`
  free: number;
  // MaintenanceMode string `json:"maintenance"`
  maintenance: string;
}

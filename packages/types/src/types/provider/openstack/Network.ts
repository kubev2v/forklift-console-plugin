import { OpenstackResource } from './Resource';

// https://github.com/kubev2v/forklift/tree/main/pkg/controller/provider/web/openstack/network.go
export interface OpenstackNetwork extends OpenstackResource {
  // Description           string    `json:"description"`
  description: string;
  // AdminStateUp          bool      `json:"adminStateUp"`
  adminStateUp: boolean;
  // Status                string    `json:"status"`
  status: string;
  // Subnets               []string  `json:"subnets,omitempty"`
  subnets?: string[];
  // TenantID              string    `json:"tenantID"`
  tenantID: string;
  // UpdatedAt             time.Time `json:"updatedAt"`
  updatedAt: string;
  // CreatedAt             time.Time `json:"createdAt"`
  createdAt: string;
  // ProjectID             string    `json:"projectID"`
  projectID: string;
  // Shared                bool      `json:"shared"`
  shared: boolean;
  // AvailabilityZoneHints []string  `json:"availabilityZoneHints,omitempty"`
  availabilityZoneHints?: string[];
  // Tags                  []string  `json:"tags,omitEmpty"`
  tags?: string[];
  // RevisionNumber        int       `json:"revisionNumber"`
  revisionNumber: number;
}

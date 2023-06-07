import { OpenstackResource } from './Resource';

// https://github.com/kubev2v/forklift/tree/main/pkg/controller/provider/web/openstack/volumetype.go
export interface OpenstackVolumeType extends OpenstackResource {
  // Description  string            `json:"description"`
  description: string;
  // ExtraSpecs   map[string]string `json:"extraSpecs,omitempty"`
  extraSpecs?: { [key: string]: string };
  // IsPublic     bool              `json:"isPublic"`
  isPublic: boolean;
  // QosSpecID    string            `json:"qosSpecsID"`
  qosSpecsID: string;
  // PublicAccess bool              `json:"publicAccess"`
  publicAccess: boolean;
}

import { Resource } from './Resource';

// https://github.com/kubev2v/forklift/tree/main/pkg/controller/provider/web/openstack/volumetype.go
export interface VolumeType extends Resource {
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

export type OpenstackVolumeType = Resource;

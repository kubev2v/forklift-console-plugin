import { Ref } from '../base/model';

// https://github.com/kubev2v/forklift/tree/main/pkg/controller/provider/web/vsphere/resource.go
export interface VSphereResource {
  // Object ID.
  // ID string `json:"id"`
  id: string;
  // Variant
  // Variant string `json:"variant,omitempty"`
  variant?: string;
  // Parent.
  // Parent model.Ref `json:"parent"`
  parent: Ref;
  // Path
  // Path string `json:"path,omitempty"`
  path?: string;
  // Revision
  // Revision int64 `json:"revision"`
  revision: number;
  // Object name.
  // Name string `json:"name"`
  name: string;
  // Self link.
  // SelfLink string `json:"selfLink"`
  selfLink: string;
}

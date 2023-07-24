// https://github.com/kubev2v/forklift/tree/main/pkg/controller/provider/web/ova/resource.go
export interface OvaResource {
  // Object ID.
  // ID string `json:"id"`
  id: string;
  // Variant
  // Variant string `json:"variant,omitempty"`
  variant?: string;
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

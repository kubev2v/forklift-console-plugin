// https://github.com/kubev2v/forklift/tree/main/pkg/controller/provider/web/ovirt/resource.go
export interface OVirtResource {
  // Object ID.
  // ID string `json:"id"`
  id: string;
  // Revision
  // Revision int64 `json:"revision"`
  revision: number;
  // Path
  // Path string `json:"path,omitempty"`
  path?: string;
  // Object name.
  // Name string `json:"name"`
  name: string;
  // Object description.
  // Description string `json:"description,omitempty"`
  description?: string;
  // Self link.
  // SelfLink string `json:"selfLink"`
  selfLink: string;
}

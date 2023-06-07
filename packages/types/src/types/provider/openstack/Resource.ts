// https://github.com/kubev2v/forklift/tree/main/pkg/controller/provider/web/openstack/resource.go
export interface OpenstackResource {
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
  // Self link.
  // SelfLink string `json:"selfLink"`
  selfLink: string;
}

// https://github.com/kubev2v/forklift/tree/main/pkg/controller/provider/web/ocp/resource.go
export interface OpenshiftResource {
  // k8s UID.
  // UID string `json:"uid"`
  uid: string;
  // k8s resource version.
  // Version string `json:"version"`
  version: string;
  // k8s namespace.
  // Namespace string `json:"namespace"`
  namespace: string;
  // k8s name.
  // Name string `json:"name"`
  name: string;
  // self link.
  // SelfLink string `json:"selfLink"`
  selfLink: string;
}

// https://github.com/kubev2v/forklift/blob/main/pkg/controller/provider/model/base/tree.go
export interface TreeNode {
  // Parent node - skipped in json
  // Parent *TreeNode `json:"-"`

  // Object kind.
  // Kind string `json:"kind"`
  kind: string;
  // Object (resource).
  // Object interface{} `json:"object"`
  object: any;
  // Child nodes.
  // Children []*TreeNode `json:"children"`
  children: TreeNode[];
}

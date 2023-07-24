import { TreeNode } from '../base/TreeNode';

// https://github.com/kubev2v/forklift/tree/main/pkg/controller/provider/model/ova/tree.go
export interface OvaTreeNode extends TreeNode {
  kind: '' | 'Datacenter' | 'Folder' | 'VM' | 'Cluster' | 'Host' | 'Network' | 'Datastore';
  children: OvaTreeNode[] | null;
}

import { TreeNode as BaseNode } from '../base/TreeNode';

// https://github.com/kubev2v/forklift/tree/main/pkg/controller/provider/model/vsphere/tree.go
export interface TreeNode extends BaseNode {
  kind: '' | 'Datacenter' | 'Folder' | 'VM' | 'Cluster' | 'Host' | 'Network' | 'Datastore';
  children: TreeNode[] | null;
}

export type VMWareTreeNode = TreeNode;

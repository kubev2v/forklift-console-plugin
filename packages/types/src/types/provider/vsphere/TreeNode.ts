import { TreeNode } from '../base/TreeNode';

// https://github.com/kubev2v/forklift/tree/main/pkg/controller/provider/model/vsphere/tree.go
export interface VSphereTreeNode extends TreeNode {
  kind: '' | 'Datacenter' | 'Folder' | 'VM' | 'Cluster' | 'Host' | 'Network' | 'Datastore';
  children: VSphereTreeNode[] | null;
}

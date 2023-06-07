import { TreeNode } from '../base/TreeNode';

// https://github.com/kubev2v/forklift/tree/main/pkg/controller/provider/model/ovirt/tree.go
export interface OvirtTreeNode extends TreeNode {
  kind:
    | ''
    | 'DataCenter'
    | 'Cluster'
    | 'Host'
    | 'VM'
    | 'NICProfile'
    | 'Network'
    | 'StorageDomain'
    | 'Disk';
  children: OvirtTreeNode[] | null;
}

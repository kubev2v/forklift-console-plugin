import { TreeNode as BaseNode } from '../base/TreeNode';

// https://github.com/kubev2v/forklift/tree/main/pkg/controller/provider/model/ovirt/tree.go
export interface TreeNode extends BaseNode {
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
  children: TreeNode[] | null;
}

export type OvirtTreeNode = TreeNode;

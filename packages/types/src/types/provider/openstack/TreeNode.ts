import { TreeNode as BaseNode } from '../base/TreeNode';

// https://github.com/kubev2v/forklift/tree/main/pkg/controller/provider/model/openstack/tree.go
export interface TreeNode extends BaseNode {
  kind:
    | ''
    | 'Project'
    | 'VM'
    | 'Region'
    | 'Image'
    | 'Flavor'
    | 'Snapshot'
    | 'Volume'
    | 'VolumeType'
    | 'Network'
    | 'Subnet';
  children: TreeNode[] | null;
}

export type OpenstackTreeNode = TreeNode;

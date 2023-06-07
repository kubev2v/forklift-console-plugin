import { TreeNode } from '../base/TreeNode';

// https://github.com/kubev2v/forklift/tree/main/pkg/controller/provider/model/openstack/tree.go
export interface OpenstackTreeNode extends TreeNode {
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
  children: OpenstackTreeNode[] | null;
}

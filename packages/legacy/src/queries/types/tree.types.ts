export enum InventoryTreeType {
  Cluster = 'Cluster',
  VM = 'VM',
}

export interface ICommonTreeObject {
  id: string;
  variant?: 'ComputeResource';
  name: string;
  selfLink: string;
  revision?: number;
  path?: string;
  is_domain?: boolean;
  description?: string;
  domain_id?: string;
  enabled?: boolean;
  parent_id?: string;
}

interface ICommonTree {
  kind: string;
  object: ICommonTreeObject | null;
  children: ICommonTree[] | null;
}

// TODO we should rename this to IClusterHostTree and use the cluster naming everywhere
export interface IInventoryHostTree extends ICommonTree {
  kind: '' | 'Datacenter' | 'DataCenter' | 'Cluster' | 'Project' | 'Folder' | 'Host' | 'VM';
  children: IInventoryHostTree[] | null;
}

export interface IVMwareFolderTree extends ICommonTree {
  kind: '' | 'Datacenter' | 'Folder' | 'VM';
  children: IVMwareFolderTree[] | null;
}

export interface IOpenstackFolderTree extends ICommonTree {
  kind: '' | 'Project' | 'VM';
  children: IOpenstackFolderTree[] | null;
}

export type InventoryTree = IInventoryHostTree | IVMwareFolderTree | IOpenstackFolderTree;

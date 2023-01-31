export enum InventoryTreeType {
  Cluster = 'Cluster',
  VM = 'VM',
}

export interface ICommonTreeObject {
  id: string;
  variant?: 'ComputeResource';
  name: string;
  selfLink: string;
}

interface ICommonTree {
  kind: string;
  object: ICommonTreeObject | null;
  children: ICommonTree[] | null;
}

// TODO we should rename this to IClusterHostTree and use the cluster naming everywhere
export interface IInventoryHostTree extends ICommonTree {
  kind: '' | 'Datacenter' | 'DataCenter' | 'Cluster' | 'Folder' | 'Host' | 'VM';
  children: IInventoryHostTree[] | null;
}

export interface IVMwareFolderTree extends ICommonTree {
  kind: '' | 'Datacenter' | 'Folder' | 'VM';
  children: IVMwareFolderTree[] | null;
}

export type InventoryTree = IInventoryHostTree | IVMwareFolderTree;

import type { ProviderVmData } from 'src/utils/types';

import type { SortDirection } from '@components/common/utils/types';
import type { TdProps } from '@patternfly/react-table';

export const folderFilterId = 'folder';

export const ROW_TYPE = {
  Concerns: 'concerns',
  Folder: 'folder',
  Vm: 'vm',
} as const;

export const COLUMN_IDS = {
  Concerns: 'concerns',
  GuestOS: 'guestOS',
  Host: 'host',
  InspectionStatus: 'inspectionStatus',
  Name: 'name',
  Path: 'path',
  Power: 'power',
} as const;

export type FolderRow = {
  folderName: string;
  isHidden: false;
  isSelected?: boolean;
  key: string;
  treeRow: TdProps['treeRow'];
  type: typeof ROW_TYPE.Folder;
};

export type VmRow = {
  isHidden: boolean;
  isSelected?: boolean;
  key: string;
  parentFolderKey: string;
  treeRow: TdProps['treeRow'];
  type: typeof ROW_TYPE.Vm;
  vmData: ProviderVmData;
};

export type ConcernsRow = {
  isHidden: boolean;
  /** this prop is a flag to the show selected toggle */
  isSelected?: boolean;
  key: string;
  parentFolderKey: string;
  type: typeof ROW_TYPE.Concerns;
  vmData: ProviderVmData;
};

export type SortColumn = (typeof COLUMN_IDS)[keyof typeof COLUMN_IDS];
export type SortState = { column: SortColumn; direction: SortDirection };

export type RowNode = FolderRow | VmRow | ConcernsRow;

type BlockItem = { concerns?: ConcernsRow; vm: VmRow };

export enum BlockKind {
  Folder = 'folder',
  Root = 'root',
}

export type FolderBlock = {
  folder: FolderRow;
  items: BlockItem[];
  kind: BlockKind.Folder;
};

export type RootBlock = {
  items: BlockItem[];
  kind: BlockKind.Root;
};

export type Block = FolderBlock | RootBlock;

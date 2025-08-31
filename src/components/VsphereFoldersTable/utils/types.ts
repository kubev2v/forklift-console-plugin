import type { VmData } from 'src/modules/Providers/views/details/tabs/VirtualMachines/components/VMCellProps';

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
  Host: 'host',
  Name: 'name',
  Path: 'path',
  Power: 'power',
} as const;

export type FolderRow = {
  type: typeof ROW_TYPE.Folder;
  key: string;
  treeRow: TdProps['treeRow'];
  folderName: string;
  isSelected?: boolean;
  isHidden: false;
};

export type VmRow = {
  type: typeof ROW_TYPE.Vm;
  key: string;
  treeRow: TdProps['treeRow'];
  vmData: VmData;
  isHidden: boolean;
  isSelected?: boolean;
  parentFolderKey: string;
};

export type ConcernsRow = {
  type: typeof ROW_TYPE.Concerns;
  key: string;
  isHidden: boolean;
  vmData: VmData;
  /** this prop is a flag to the show selected toggle */
  isSelected?: boolean;
  parentFolderKey: string;
};

export type SortColumn = (typeof COLUMN_IDS)[keyof typeof COLUMN_IDS];
export type SortState = { column: SortColumn; direction: SortDirection };

export type RowNode = FolderRow | VmRow | ConcernsRow;

type BlockItem = { vm: VmRow; concerns?: ConcernsRow };

export enum BlockKind {
  Folder = 'folder',
  Root = 'root',
}

export type FolderBlock = {
  kind: BlockKind.Folder;
  folder: FolderRow;
  items: BlockItem[];
};

export type RootBlock = {
  kind: BlockKind.Root;
  items: BlockItem[];
};

export type Block = FolderBlock | RootBlock;

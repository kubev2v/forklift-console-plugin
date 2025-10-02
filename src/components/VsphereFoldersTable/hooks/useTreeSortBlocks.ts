import { type ComponentProps, useMemo, useState } from 'react';

import type { ResourceField, SortDirection } from '@components/common/utils/types';
import {
  type Block,
  BlockKind,
  COLUMN_IDS,
  type FolderBlock,
  type RootBlock,
  ROW_TYPE,
  type RowNode,
  type SortColumn,
  type SortState,
} from '@components/VsphereFoldersTable/utils/types';
import type { OnSort, Th } from '@patternfly/react-table';
import { isEmpty } from '@utils/helpers';

import { nameColumn } from '../utils/constants';

import { NO_FOLDER } from './utils/constants';
import { buildVmComparator, cmpStr, getFolderNameFromFolderRow } from './utils/treeUtils';

type UseTreeSortBlocks = (args: {
  filteredRows: RowNode[]; // output of useTreeFilters
  columns: ResourceField[];
}) => {
  sortedBlocks: Block[];
  sortBy: {
    direction: SortDirection;
    index: number;
  };
  visibleCols: {
    id: string;
    label: string;
    sortable: boolean;
  }[];
  handleOnSort: OnSort | undefined;
};

/**
 * Build folder blocks and sort VMs inside each block.
 */
const useTreeSortBlocks: UseTreeSortBlocks = ({ columns, filteredRows }) => {
  const [sort, setSort] = useState<SortState>({ column: COLUMN_IDS.Name, direction: 'asc' });

  const sortedBlocks = useMemo(() => {
    if (isEmpty(filteredRows)) return [];

    const blocks: Block[] = [];
    let current: Block | null = null;

    for (let idx = 0; idx < filteredRows.length; ) {
      const row = filteredRows[idx];

      if (row.type === ROW_TYPE.Folder) {
        current = { folder: row, items: [], kind: BlockKind.Folder } as FolderBlock;
        blocks.push(current);
        idx += 1;
      }

      if (row.type === ROW_TYPE.Vm) {
        if (!current || (current.kind === BlockKind.Folder && row.parentFolderKey === NO_FOLDER)) {
          current = { items: [], kind: BlockKind.Root } as RootBlock;
          blocks.push(current);
        }

        const next = filteredRows[idx + 1];
        const concerns =
          next &&
          next.type === ROW_TYPE.Concerns &&
          !next.isHidden &&
          next.parentFolderKey === row.parentFolderKey
            ? next
            : undefined;

        current.items.push({ concerns, vm: row });
        idx += concerns ? 2 : 1;
      }

      if (row.type === ROW_TYPE.Concerns) {
        // a stray concerns row; skip
        idx += 1;
      }
    }

    const cmpVm = buildVmComparator(sort);
    for (const block of blocks) {
      const { items } = block;
      if (items.length > 1) items.sort((first, second) => cmpVm(first.vm, second.vm));
    }

    if (sort.column === COLUMN_IDS.Name && blocks.length > 1) {
      const dir = sort.direction === 'asc' ? 1 : -1;
      blocks.sort((a, b) => {
        if (a.kind === BlockKind.Root && b.kind === BlockKind.Folder) return -1 * dir;
        if (a.kind === BlockKind.Folder && b.kind === BlockKind.Root) return dir;

        if (a.kind === BlockKind.Folder && b.kind === BlockKind.Folder) {
          const fa = getFolderNameFromFolderRow(a.folder);
          const fb = getFolderNameFromFolderRow(b.folder);
          return dir * cmpStr(fa, fb);
        }

        return 0;
      });
    }

    return blocks;
  }, [filteredRows, sort]);

  const visibleCols = useMemo(
    () => [
      { ...nameColumn, sortable: true },
      ...columns
        .filter((col) => col.isVisible)
        .map((col) => ({
          id: col.resourceFieldId!,
          label: col.label ?? '',
          sortable: true,
        })),
    ],
    [columns],
  );

  const activeIndex = Math.max(
    0,
    visibleCols.findIndex((column) => column.id === sort.column),
  );

  const sortBy = { direction: sort.direction, index: activeIndex };

  const handleOnSort: NonNullable<ComponentProps<typeof Th>['sort']>['onSort'] = (
    _e,
    columnIndex,
    newDirection,
  ) => {
    const col = visibleCols[columnIndex];
    if (!col?.sortable) return;
    const nextDir = columnIndex === activeIndex ? newDirection : 'asc';
    setSort({ column: col.id as SortColumn, direction: nextDir });
  };

  return { handleOnSort, sortBy, sortedBlocks, visibleCols };
};

export default useTreeSortBlocks;

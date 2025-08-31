import { useMemo } from 'react';

import {
  type Block,
  BlockKind,
  ROW_TYPE,
  type RowNode,
  type VmRow,
} from '@components/VsphereFoldersTable/utils/types';
import { isEmpty } from '@utils/helpers';

import { paginationInitialState } from './usePagination/utils/constants';

type UseTreePaginationArgs = {
  blocks: Block[];
  page: number;
  perPage: number;
};

type UseTreePaginationReturn = {
  itemCount: number; // folders + *visible* VMs (concerns never count)
  pagedRows: RowNode[]; // rows for the page; concerns only appended for in-page visible VMs
};

type DisplayDescriptor =
  | { type: typeof ROW_TYPE.Folder; blockIndex: number }
  | { type: typeof ROW_TYPE.Vm; blockIndex: number; vmIndex: number };

/**
 * Row-based pagination with a "sticky" folder header:
 * If a page starts in the middle of a folder (first descriptor is a VM),
 * the folder row is prepended so users keep context. This header does not
 * count toward pagination.
 */
const useTreePagination = ({
  blocks,
  page,
  perPage,
}: UseTreePaginationArgs): UseTreePaginationReturn => {
  return useMemo(() => {
    const hasBlocks = Array.isArray(blocks) && !isEmpty(blocks);
    const safePerPage =
      Number.isFinite(perPage) && perPage > 0 ? perPage : paginationInitialState.perPage;
    const safePage = Number.isFinite(page) && page > 0 ? page : paginationInitialState.page;

    if (!hasBlocks) return { itemCount: 0, pagedRows: [] };

    const displayDescriptors: DisplayDescriptor[] = [];

    for (let blockIndex = 0; blockIndex < blocks.length; blockIndex += 1) {
      const block = blocks[blockIndex];

      if (block.kind === BlockKind.Folder && !block.folder?.isHidden) {
        displayDescriptors.push({ blockIndex, type: ROW_TYPE.Folder });
      }

      const items = block.items ?? [];

      for (let vmIndex = 0; vmIndex < items.length; vmIndex += 1) {
        const vmRow = items[vmIndex]?.vm as VmRow | undefined;
        if (vmRow && !vmRow.isHidden) {
          displayDescriptors.push({ blockIndex, type: ROW_TYPE.Vm, vmIndex });
        }
      }
    }

    const itemCount = displayDescriptors.length;
    if (itemCount === 0) return { itemCount: 0, pagedRows: [] };

    const pageStartIndex = (safePage - 1) * safePerPage;
    const pageEndIndex = Math.min(pageStartIndex + safePerPage, itemCount);
    const pageDescriptors = displayDescriptors.slice(pageStartIndex, pageEndIndex);

    const pagedRows: RowNode[] = [];

    if (!isEmpty(pageDescriptors) && pageDescriptors[0].type === ROW_TYPE.Vm) {
      const [firstDescriptor] = pageDescriptors;
      const parentBlock = blocks[firstDescriptor.blockIndex];
      if (parentBlock.kind === BlockKind.Folder) {
        // sticky header (not counted)
        pagedRows.push(parentBlock.folder);
      }
    }

    for (const descriptor of pageDescriptors) {
      if (descriptor.type === ROW_TYPE.Folder) {
        const block = blocks[descriptor.blockIndex];
        if (block.kind === BlockKind.Folder) pagedRows.push(block.folder);
      } else {
        const { blockIndex, vmIndex } = descriptor;
        const item = blocks[blockIndex].items[vmIndex];
        pagedRows.push(item.vm);
        const concernsRow = item.concerns;
        if (concernsRow && !concernsRow.isHidden) {
          pagedRows.push(concernsRow);
        }
      }
    }

    return { itemCount, pagedRows };
  }, [blocks, page, perPage]);
};

export default useTreePagination;

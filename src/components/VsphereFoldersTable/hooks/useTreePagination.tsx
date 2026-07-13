import { useMemo } from 'react';

import {
  type Block,
  BlockKind,
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
  itemCount: number;
  pagedRows: RowNode[];
};

type PageDescriptor =
  | { kind: 'collapsedFolder'; blockIndex: number }
  | { kind: 'vm'; blockIndex: number; vmIndex: number };

/**
 * Pagination that counts only user-visible items (VMs + collapsed folders).
 *
 * - Collapsed folders (no visible child VMs) are countable rows so users
 *   can see and expand them.
 * - Expanded folders are free context headers injected alongside their
 *   child VMs without consuming a pagination slot.
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

    const descriptors: PageDescriptor[] = [];

    for (let blockIndex = 0; blockIndex < blocks.length; blockIndex += 1) {
      const block = blocks[blockIndex];
      const items = block.items ?? [];

      const visibleVmIndices: number[] = [];
      for (let vmIndex = 0; vmIndex < items.length; vmIndex += 1) {
        const vmRow = items[vmIndex]?.vm as VmRow | undefined;
        if (vmRow && !vmRow.isHidden) {
          visibleVmIndices.push(vmIndex);
        }
      }

      if (block.kind === BlockKind.Folder && isEmpty(visibleVmIndices)) {
        descriptors.push({ blockIndex, kind: 'collapsedFolder' });
      } else {
        for (const vmIndex of visibleVmIndices) {
          descriptors.push({ blockIndex, kind: 'vm', vmIndex });
        }
      }
    }

    const itemCount = descriptors.length;
    if (itemCount === 0) return { itemCount: 0, pagedRows: [] };

    const pageStartIndex = (safePage - 1) * safePerPage;
    const pageEndIndex = Math.min(pageStartIndex + safePerPage, itemCount);
    const pageDescriptors = descriptors.slice(pageStartIndex, pageEndIndex);

    const pagedRows: RowNode[] = [];
    const addedFolders = new Set<number>();

    for (const descriptor of pageDescriptors) {
      const { blockIndex } = descriptor;
      const block = blocks[blockIndex];

      if (descriptor.kind === 'collapsedFolder') {
        if (block.kind === BlockKind.Folder) {
          pagedRows.push(block.folder);
        }
      } else {
        if (block.kind === BlockKind.Folder && !addedFolders.has(blockIndex)) {
          addedFolders.add(blockIndex);
          pagedRows.push(block.folder);
        }

        const item = block.items[descriptor.vmIndex];
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

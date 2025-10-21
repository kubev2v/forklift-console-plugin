import { useMemo } from 'react';

import type { AttributeFilters } from '@components/VsphereFoldersTable/components/AttributeFilter/hooks/useAttributeFilters';
import {
  type ConcernsRow,
  type FolderRow,
  ROW_TYPE,
  type RowNode,
  type VmRow,
} from '@components/VsphereFoldersTable/utils/types';

import { getFolderNameFromKey } from './utils/utils';

type UseTreeFilters = {
  filters: AttributeFilters<VmRow>;
  rows: RowNode[];
  showAll: boolean;
};

const useTreeFilters = ({
  filters,
  rows,
  showAll,
}: UseTreeFilters): {
  filteredRows: RowNode[];
  filteredGroupVMCountByFolder: Map<string, number>;
} => {
  const filteredGroupVMCountByFolder = useMemo(() => new Map<string, number>(), []);
  const { visibleFolderKeySet, visibleVmKeySet } = useMemo(() => {
    if (!filters.hasAttrFilters && showAll) {
      return {
        visibleFolderKeySet: new Set<string>(),
        visibleVmKeySet: new Set<string>(),
      };
    }

    const vmSet = new Set<string>();
    const folderSet = new Set<string>();

    for (const row of rows) {
      if (row.type === ROW_TYPE.Vm) {
        const isCandidate = (showAll || row.isSelected) && filters.predicate(row);
        if (isCandidate) {
          vmSet.add(row.key);
          folderSet.add(row.parentFolderKey);
        }
      }
    }

    return { visibleFolderKeySet: folderSet, visibleVmKeySet: vmSet };
  }, [rows, filters, showAll]);

  const filteredRows: RowNode[] = useMemo(() => {
    if (!filters.hasAttrFilters && showAll) return rows;

    const isVisibleFolder = (row: FolderRow) => visibleFolderKeySet.has(row.key);

    const isVisibleVm = (row: VmRow) => visibleVmKeySet.has(row.key);

    const shouldAttachConcerns = (vm: VmRow, next: RowNode | undefined): next is ConcernsRow =>
      Boolean(next) &&
      next.type === ROW_TYPE.Concerns &&
      !next.isHidden &&
      next.parentFolderKey === vm.parentFolderKey;

    const out: RowNode[] = [];
    for (let i = 0; i < rows.length; i += 1) {
      const row = rows[i];

      switch (row.type) {
        case ROW_TYPE.Folder: {
          if (isVisibleFolder(row)) {
            out.push(row);
            filteredGroupVMCountByFolder.set(row.folderName, 0);
          }
          break;
        }

        case ROW_TYPE.Vm: {
          if (!isVisibleVm(row)) break;
          out.push(row);

          const folderName = getFolderNameFromKey(row.parentFolderKey);
          const previousCount = filteredGroupVMCountByFolder.get(folderName) ?? 0;
          filteredGroupVMCountByFolder.set(folderName, previousCount + 1);

          const next = rows[i + 1];
          if (shouldAttachConcerns(row, next)) {
            out.push(next);
            i += 1; // skip the concerns we consumed
          }
          break;
        }

        // Concerns rows are only added when attached to a visible VM above
        case ROW_TYPE.Concerns:
        default:
          break;
      }
    }

    return out;
  }, [
    filters.hasAttrFilters,
    showAll,
    rows,
    visibleFolderKeySet,
    visibleVmKeySet,
    filteredGroupVMCountByFolder,
  ]);

  return { filteredGroupVMCountByFolder, filteredRows };
};

export default useTreeFilters;

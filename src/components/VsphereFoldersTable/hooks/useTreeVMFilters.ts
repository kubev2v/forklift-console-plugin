import { useMemo } from 'react';

import type { AttributeFilters } from '@components/VsphereFoldersTable/components/AttributeFilter/hooks/useAttributeFilters';
import { ROW_TYPE, type RowNode, type VmRow } from '@components/VsphereFoldersTable/utils/types';

type UseTreeFilters = {
  filters: AttributeFilters<VmRow>;
  rows: RowNode[];
  showAll: boolean;
};

const useTreeFilters = ({ filters, rows, showAll }: UseTreeFilters): RowNode[] => {
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

    const out: RowNode[] = [];
    let idx = 0;

    while (idx < rows.length) {
      const row = rows[idx];

      if (row.type === ROW_TYPE.Folder) {
        if (visibleFolderKeySet.has(row.key)) {
          out.push(row);
        }
        idx += 1;
      } else if (row.type === ROW_TYPE.Vm) {
        if (visibleVmKeySet.has(row.key)) {
          out.push(row);
          // Attach concerns row if it immediately follows and is visible
          const next = rows[idx + 1];
          if (
            next &&
            next.type === ROW_TYPE.Concerns &&
            !next.isHidden &&
            next.parentFolderKey === row.parentFolderKey
          ) {
            out.push(next);
            idx += 2; // skip the concerns we consumed
          } else {
            idx += 1;
          }
        } else {
          idx += 1;
        }
      } else {
        idx += 1;
      }
    }

    return out;
  }, [filters.hasAttrFilters, showAll, rows, visibleFolderKeySet, visibleVmKeySet]);

  return filteredRows;
};

export default useTreeFilters;

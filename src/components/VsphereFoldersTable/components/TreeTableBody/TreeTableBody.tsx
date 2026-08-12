import type { Dispatch, FC, SetStateAction } from 'react';

import type { ResourceField } from '@components/common/utils/types';
import ConcernsAndConditionsTable from '@components/ConcernsAndConditionsTable/ConcernsAndConditionsTable';
import InspectionExpandedSection from '@components/InspectVirtualMachines/InspectionExpandedSection';
import { ROW_TYPE, type RowNode } from '@components/VsphereFoldersTable/utils/types';
import { Stack, StackItem } from '@patternfly/react-core';
import { Tbody, Td, Tr } from '@patternfly/react-table';
import type { V1beta1Conversion } from '@utils/crds/conversion/types';
import { isEmpty } from '@utils/helpers';

import FolderTreeRow from '../FolderTreeRow/FolderTreeRow';
import TreeTableEmptyState from '../TreeTableEmptyState/TreeTableEmptyState';
import VmTreeRow from '../VmTreeRow/VmTreeRow';

type TreeTableBodyProps = {
  clearAllFilters: () => void;
  columns: ResourceField[];
  conversions: V1beta1Conversion[];
  groupVMCountByFolder: Map<string, number>;
  hasFiltersApplied: boolean;
  inspectionExpandedRows: Set<string>;
  onToggleInspectionExpand: Dispatch<SetStateAction<Set<string>>>;
  pagedRows: RowNode[];
  showAll: boolean;
};

const TreeTableBody: FC<TreeTableBodyProps> = ({
  clearAllFilters,
  columns,
  conversions,
  groupVMCountByFolder,
  hasFiltersApplied,
  inspectionExpandedRows,
  onToggleInspectionExpand,
  pagedRows,
  showAll,
}) => {
  const colSpan = columns.length + 1;

  if (isEmpty(pagedRows)) {
    return (
      <TreeTableEmptyState
        clearAllFilters={clearAllFilters}
        colSpan={colSpan}
        hasFiltersApplied={hasFiltersApplied}
      />
    );
  }

  return (
    <Tbody>
      {pagedRows
        .filter((row) => (showAll ? true : row.isSelected))
        .map((row) => {
          if (row.type === ROW_TYPE.Folder) {
            return (
              <FolderTreeRow groupVMCountByFolder={groupVMCountByFolder} key={row.key} row={row} />
            );
          }

          if (row.type === ROW_TYPE.Vm) {
            return (
              <VmTreeRow columns={columns} conversions={conversions} key={row.key} row={row} />
            );
          }

          if (row.type === ROW_TYPE.Concerns) {
            return (
              <Tr isHidden={row.isHidden} key={row.key}>
                <Td colSpan={colSpan}>
                  <Stack hasGutter>
                    <StackItem>
                      <ConcernsAndConditionsTable vmData={row.vmData} />
                    </StackItem>
                    <StackItem>
                      <InspectionExpandedSection
                        conversions={conversions}
                        expandedRows={inspectionExpandedRows}
                        onToggleExpand={onToggleInspectionExpand}
                        vmId={row.vmData.vm?.id ?? ''}
                      />
                    </StackItem>
                  </Stack>
                </Td>
              </Tr>
            );
          }

          return null;
        })}
    </Tbody>
  );
};

export default TreeTableBody;

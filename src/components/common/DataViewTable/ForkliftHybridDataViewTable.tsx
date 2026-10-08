import type { FC, ReactElement, ReactNode } from 'react';

import { Bullseye } from '@patternfly/react-core';
import { DataViewTableHead } from '@patternfly/react-data-view';
import type { DataViewTh } from '@patternfly/react-data-view/dist/esm/DataViewTable/DataViewTable';
import { InnerScrollContainer, Table, Tbody, Td, Tr } from '@patternfly/react-table';

import { useTableColumnWidthContext } from '../TableView/TableColumnWidthContext';
import type { RowProps, SortType } from '../TableView/types';
import { UID } from '../utils/constants';
import type { ResourceField } from '../utils/types';

import { FORKLIFT_DATA_VIEW_TABLE_CLASS } from './forkliftDataViewTableClass';
import { useForkliftDataViewColumns } from './useForkliftDataViewColumns';

import './ForkliftDataViewTable.scss';

type ForkliftHybridDataViewTableProps<T> = {
  activeSort: SortType;
  'aria-label': string;
  entities: T[];
  expandedIds?: string[];
  leadingColumns?: DataViewTh[];
  namespace: string;
  placeholder?: ReactNode;
  RowComponent: FC<RowProps<T>>;
  setActiveSort: (sort: SortType) => void;
  toId?: (item: T) => string;
  uidFieldId?: string;
  visibleColumns: ResourceField[];
};

const ForkliftHybridDataViewTable = <T,>({
  activeSort,
  'aria-label': ariaLabel,
  entities,
  expandedIds,
  leadingColumns,
  namespace,
  placeholder,
  RowComponent,
  setActiveSort,
  toId,
  uidFieldId = UID,
  visibleColumns,
}: ForkliftHybridDataViewTableProps<T>): ReactElement => {
  const { columnLayoutKey } = useTableColumnWidthContext();
  const columns = useForkliftDataViewColumns({
    activeSort,
    leadingColumns,
    setActiveSort,
    visibleColumns,
  });
  const columnSignature = visibleColumns.map(({ resourceFieldId: id }) => id).join();

  return (
    <InnerScrollContainer>
      <Table
        aria-label={ariaLabel}
        className={FORKLIFT_DATA_VIEW_TABLE_CLASS}
        isStickyHeader
        key={columnLayoutKey}
        variant="compact"
      >
        <DataViewTableHead columns={columns} hasResizableColumns />
        <Tbody>
          {placeholder ? (
            <Tr>
              <Td colSpan={columns.length}>
                <Bullseye>{placeholder}</Bullseye>
              </Td>
            </Tr>
          ) : (
            entities.map((resourceData, index) => (
              <RowComponent
                isExpanded={expandedIds?.includes(toId ? toId(resourceData) : '')}
                key={`${columnSignature}_${String(resourceData?.[uidFieldId as keyof T] ?? index)}`}
                length={Math.max(columns.length - 1, 1)}
                namespace={namespace}
                resourceData={resourceData}
                resourceFields={visibleColumns}
                resourceIndex={index}
              />
            ))
          )}
        </Tbody>
      </Table>
    </InnerScrollContainer>
  );
};

export default ForkliftHybridDataViewTable;

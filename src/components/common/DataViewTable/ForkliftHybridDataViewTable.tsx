/**
 * DataView table for StandardPage rows that combine resizable columns with expand and/or
 * selection leading cells (see `useDataViewSelection`). Use `ForkliftDataViewTable` when
 * rows do not need expand or the hybrid leading-column layout.
 */
import type { FC, ReactElement, ReactNode } from 'react';

import { Bullseye } from '@patternfly/react-core';
import { DataViewTableHead } from '@patternfly/react-data-view';
import type { DataViewTh } from '@patternfly/react-data-view/dist/esm/DataViewTable/DataViewTable';
import { InnerScrollContainer, Table, Tbody, Td, Tr } from '@patternfly/react-table';

import { getTableColumnLayoutKey } from '../TableView/columnWidthUtils';
import { useTableColumnWidthContext } from '../TableView/TableColumnWidthContext';
import type { RowProps, SortType } from '../TableView/types';
import { UID } from '../utils/constants';
import type { ResourceField } from '../utils/types';

import { getRenderedColumnCount } from './dataViewColumnUtils';
import {
  FORKLIFT_DATA_VIEW_TABLE_CLASS,
  FORKLIFT_DATA_VIEW_TABLE_LAYOUT_CLASS,
} from './forkliftDataViewTableClass';
import { useDefaultColumnLayout } from './useDefaultColumnLayout';
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
  const { columnLayoutKey, hasCustomColumnWidths } = useTableColumnWidthContext();
  const layoutKey = getTableColumnLayoutKey(columnLayoutKey, visibleColumns);
  const { defaultLayoutVersion, layoutRef } = useDefaultColumnLayout({
    hasCustomColumnWidths,
    layoutKey,
  });
  const columns = useForkliftDataViewColumns({
    activeSort,
    leadingColumns,
    setActiveSort,
    visibleColumns,
  });
  const columnSignature = visibleColumns.map(({ resourceFieldId: id }) => id).join();
  const renderedColumnCount = getRenderedColumnCount(columns.length, hasCustomColumnWidths);

  return (
    <div className={FORKLIFT_DATA_VIEW_TABLE_LAYOUT_CLASS} ref={layoutRef}>
      <InnerScrollContainer>
        <Table
          aria-label={ariaLabel}
          className={FORKLIFT_DATA_VIEW_TABLE_CLASS}
          data-column-widths-customized={hasCustomColumnWidths}
          isStickyHeader
          key={`${layoutKey}-${defaultLayoutVersion}`}
          variant="compact"
        >
          <DataViewTableHead columns={columns} hasResizableColumns />
          <Tbody>
            {placeholder ? (
              <Tr>
                <Td colSpan={renderedColumnCount}>
                  <Bullseye>{placeholder}</Bullseye>
                </Td>
              </Tr>
            ) : (
              entities.map((resourceData, index) => (
                <RowComponent
                  isExpanded={expandedIds?.includes(toId ? toId(resourceData) : '')}
                  key={`${columnSignature}_${String(resourceData?.[uidFieldId as keyof T] ?? index)}`}
                  length={Math.max(renderedColumnCount - 1, 1)}
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
    </div>
  );
};

export default ForkliftHybridDataViewTable;

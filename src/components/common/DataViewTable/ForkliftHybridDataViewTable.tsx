/** Renders each StandardPage row once while retaining its native PatternFly cells. */
import type { FC, ReactElement, ReactNode } from 'react';

import { Bullseye } from '@patternfly/react-core';
import type { DataViewTh } from '@patternfly/react-data-view/dist/esm/DataViewTable/DataViewTable';
import { InnerScrollContainer, Table, Tbody, Td, Tr } from '@patternfly/react-table';

import { getTableColumnLayoutKey } from '../TableView/columnWidthUtils';
import { useTableColumnWidthContext } from '../TableView/TableColumnWidthContext';
import type { RowProps, SortType } from '../TableView/types';
import { UID } from '../utils/constants';
import type { ResourceField } from '../utils/types';

import { getRenderedColumnCount } from './dataViewColumnUtils';
import { DATA_CONTROL_COLUMN_ATTR } from './dataViewTableConstants';
import {
  FORKLIFT_DATA_VIEW_TABLE_CLASS,
  FORKLIFT_DATA_VIEW_TABLE_LAYOUT_CLASS,
} from './forkliftDataViewTableClass';
import ForkliftResizableTableHead from './ForkliftResizableTableHead';
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

const getControlColumnId = (column: DataViewTh): string => {
  if (!column || typeof column !== 'object' || !('cell' in column)) return '';
  const { props } = column;
  if (!props || !(DATA_CONTROL_COLUMN_ATTR in props)) return '';
  const marker = props[DATA_CONTROL_COLUMN_ATTR];
  return typeof marker === 'string' ? marker : '';
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
  const controlColumnSignature = leadingColumns?.map(getControlColumnId).join('|') ?? '';
  const layoutKey = getTableColumnLayoutKey(
    columnLayoutKey,
    visibleColumns,
    controlColumnSignature,
  );
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
          gridBreakPoint=""
          isStickyHeader
          key={`${layoutKey}-${defaultLayoutVersion}`}
          variant="compact"
        >
          <ForkliftResizableTableHead columns={columns} />
          <Tbody>
            {placeholder ? (
              <Tr>
                <Td colSpan={renderedColumnCount}>
                  <Bullseye>{placeholder}</Bullseye>
                </Td>
              </Tr>
            ) : (
              entities.map((resourceData, index) => {
                const id = toId?.(resourceData);
                const rowId = id?.length
                  ? id
                  : String(resourceData?.[uidFieldId as keyof T] ?? index);
                return (
                  <RowComponent
                    isExpanded={expandedIds?.includes(id ?? '')}
                    key={`${columnSignature}_${rowId}`}
                    length={Math.max(renderedColumnCount - 1, 1)}
                    namespace={namespace}
                    resourceData={resourceData}
                    resourceFields={visibleColumns}
                    resourceIndex={index}
                  />
                );
              })
            )}
          </Tbody>
        </Table>
      </InnerScrollContainer>
    </div>
  );
};

export default ForkliftHybridDataViewTable;

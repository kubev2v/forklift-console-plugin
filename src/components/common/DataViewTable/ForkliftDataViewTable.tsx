/**
 * Resizable DataView table for StandardPage list rows rendered entirely through PatternFly
 * DataView cells. Use `ForkliftHybridDataViewTable` when rows need expand/selection leading cells.
 */
import type { FC, ReactElement, ReactNode } from 'react';

import { Bullseye } from '@patternfly/react-core';
import { DataViewTable } from '@patternfly/react-data-view';
import type {
  DataViewTd,
  DataViewTh,
} from '@patternfly/react-data-view/dist/esm/DataViewTable/DataViewTable';

import { getTableColumnLayoutKey } from '../TableView/columnWidthUtils';
import { useTableColumnWidthContext } from '../TableView/TableColumnWidthContext';
import type { RowProps, SortType } from '../TableView/types';
import type { ResourceField } from '../utils/types';

import { getRenderedColumnCount } from './dataViewColumnUtils';
import {
  FORKLIFT_DATA_VIEW_TABLE_CLASS,
  FORKLIFT_DATA_VIEW_TABLE_LAYOUT_CLASS,
} from './forkliftDataViewTableClass';
import { useDefaultColumnLayout } from './useDefaultColumnLayout';
import { useForkliftDataViewColumns } from './useForkliftDataViewColumns';
import { useForkliftDataViewRows } from './useForkliftDataViewRows';

import './ForkliftDataViewTable.scss';

type ForkliftDataViewTableProps<T> = {
  activeSort: SortType;
  'aria-label': string;
  entities: T[];
  getLeadingCells?: (entity: T, index: number) => DataViewTd[];
  leadingColumns?: DataViewTh[];
  namespace: string;
  placeholder?: ReactNode;
  RowComponent: FC<RowProps<T>>;
  setActiveSort: (sort: SortType) => void;
  visibleColumns: ResourceField[];
};

const ForkliftDataViewTable = <T,>({
  activeSort,
  'aria-label': ariaLabel,
  entities,
  getLeadingCells,
  leadingColumns,
  namespace,
  placeholder,
  RowComponent,
  setActiveSort,
  visibleColumns,
}: ForkliftDataViewTableProps<T>): ReactElement => {
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
  const dataRows = useForkliftDataViewRows({
    entities: placeholder ? [] : entities,
    getLeadingCells,
    namespace,
    RowComponent,
    visibleColumns,
  });
  const renderedColumnCount = getRenderedColumnCount(columns.length, hasCustomColumnWidths);
  const rows = placeholder
    ? [
        {
          row: [
            {
              cell: <Bullseye>{placeholder}</Bullseye>,
              props: { colSpan: renderedColumnCount },
            },
          ],
        },
      ]
    : dataRows;

  return (
    <div className={FORKLIFT_DATA_VIEW_TABLE_LAYOUT_CLASS} ref={layoutRef}>
      <DataViewTable
        aria-label={ariaLabel}
        className={FORKLIFT_DATA_VIEW_TABLE_CLASS}
        columns={columns}
        data-column-widths-customized={hasCustomColumnWidths}
        gridBreakPoint=""
        isResizable
        isStickyHeader
        key={`${layoutKey}-${defaultLayoutVersion}`}
        rows={rows}
        variant="compact"
      />
    </div>
  );
};

export default ForkliftDataViewTable;

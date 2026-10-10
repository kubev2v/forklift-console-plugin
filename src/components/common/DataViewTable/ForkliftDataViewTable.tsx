import type { FC, ReactElement, ReactNode } from 'react';

import { Bullseye } from '@patternfly/react-core';
import { DataViewTable } from '@patternfly/react-data-view';
import type {
  DataViewTd,
  DataViewTh,
} from '@patternfly/react-data-view/dist/esm/DataViewTable/DataViewTable';

import { useTableColumnWidthContext } from '../TableView/TableColumnWidthContext';
import type { RowProps, SortType } from '../TableView/types';
import type { ResourceField } from '../utils/types';

import { FORKLIFT_DATA_VIEW_TABLE_CLASS } from './forkliftDataViewTableClass';
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
  const { columnLayoutKey } = useTableColumnWidthContext();
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
  const rows = placeholder
    ? [
        {
          row: [
            {
              cell: <Bullseye>{placeholder}</Bullseye>,
              props: { colSpan: columns.length },
            },
          ],
        },
      ]
    : dataRows;

  return (
    <DataViewTable
      aria-label={ariaLabel}
      className={FORKLIFT_DATA_VIEW_TABLE_CLASS}
      columns={columns}
      gridBreakPoint=""
      isResizable
      isStickyHeader
      key={columnLayoutKey}
      rows={rows}
      variant="compact"
    />
  );
};

export default ForkliftDataViewTable;

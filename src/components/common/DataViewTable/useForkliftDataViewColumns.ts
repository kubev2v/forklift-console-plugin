import { createElement, Fragment, useMemo } from 'react';

import type { DataViewTh } from '@patternfly/react-data-view/dist/esm/DataViewTable/DataViewTable';

import { useTableColumnWidthContext } from '../TableView/TableColumnWidthContext';
import type { SortType } from '../TableView/types';
import type { ResourceField } from '../utils/types';

import { getColumnWidthSpacerProps, toDataViewColumn } from './dataViewColumnUtils';

type UseForkliftDataViewColumnsArgs = {
  activeSort: SortType;
  leadingColumns?: DataViewTh[];
  setActiveSort: (sort: SortType) => void;
  visibleColumns: ResourceField[];
};

export const useForkliftDataViewColumns = ({
  activeSort,
  leadingColumns = [],
  setActiveSort,
  visibleColumns,
}: UseForkliftDataViewColumnsArgs): DataViewTh[] => {
  const { getResizableProps } = useTableColumnWidthContext();

  return useMemo((): DataViewTh[] => {
    const spacer: DataViewTh = {
      cell: createElement(Fragment),
      props: getColumnWidthSpacerProps(),
    };
    const columns = visibleColumns.flatMap((field, columnIndex) => [
      ...(field.isAction ? [spacer] : []),
      toDataViewColumn({
        activeSort,
        columnIndex,
        field,
        resizableProps: getResizableProps(field, field.label),
        setActiveSort,
        visibleColumns,
      }),
    ]);
    return [
      ...leadingColumns,
      ...columns,
      ...(visibleColumns.some((field) => field.isAction) ? [] : [spacer]),
    ];
  }, [activeSort, getResizableProps, leadingColumns, setActiveSort, visibleColumns]);
};

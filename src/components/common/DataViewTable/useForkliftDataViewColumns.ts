import { useMemo } from 'react';

import type { DataViewTh } from '@patternfly/react-data-view/dist/esm/DataViewTable/DataViewTable';

import { useTableColumnWidthContext } from '../TableView/TableColumnWidthContext';
import type { SortType } from '../TableView/types';
import type { ResourceField } from '../utils/types';

import { toDataViewColumn } from './dataViewColumnUtils';

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
  const { getColumnHeaderLayoutProps, getResizableProps } = useTableColumnWidthContext();
  const visibleColumnCount = visibleColumns.length;

  return useMemo(
    () => [
      ...leadingColumns,
      ...visibleColumns.map((field, columnIndex) =>
        toDataViewColumn({
          activeSort,
          columnIndex,
          field,
          headerLayoutProps: getColumnHeaderLayoutProps(field, visibleColumnCount),
          resizableProps: getResizableProps(field, field.label),
          setActiveSort,
          visibleColumns,
        }),
      ),
    ],
    [
      activeSort,
      getColumnHeaderLayoutProps,
      getResizableProps,
      leadingColumns,
      setActiveSort,
      visibleColumnCount,
      visibleColumns,
    ],
  );
};

import { type FC, type PropsWithChildren, useMemo } from 'react';

import { TableSortContext } from '@components/TableSortContext';

import { useSort } from './common/TableView/sort';
import type { ResourceField, SortDirection } from './common/utils/types';

type TableSortContextProviderProps = PropsWithChildren & {
  defaultSort?: { direction: SortDirection; resourceFieldId: string };
  fields: ResourceField[];
};

export const TableSortContextProvider: FC<TableSortContextProviderProps> = ({
  children,
  defaultSort,
  fields,
}) => {
  const [activeSort, setActiveSort, compareFn] = useSort(fields, 'en', defaultSort);

  const tableSortContextValue = useMemo(
    () => ({ activeSort, compareFn, setActiveSort }),
    [activeSort, compareFn, setActiveSort],
  );

  return (
    <TableSortContext.Provider value={tableSortContextValue}>{children}</TableSortContext.Provider>
  );
};

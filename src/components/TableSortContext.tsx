import React, { createContext, type FC, type PropsWithChildren, useContext } from 'react';

import { useSort } from './common/TableView/sort';
import type { SortType } from './common/TableView/types';
import type { ResourceField } from './common/utils/types';

export type TableSortContextProps = {
  activeSort: SortType;
  setActiveSort: (activeSort: SortType) => void;
  compareFn: (a: unknown, b: unknown) => number;
};

const defaultTableSortContext = {
  activeSort: { isAsc: true, label: '', resourceFieldId: undefined },
  compareFn: () => undefined,
  setActiveSort: () => undefined,
};

export const TableSortContext = createContext<TableSortContextProps>(defaultTableSortContext);

type TableSortContextProviderProps = PropsWithChildren & {
  fields: ResourceField[];
};

export const TableSortContextProvider: FC<TableSortContextProviderProps> = ({
  children,
  fields,
}) => {
  const [activeSort, setActiveSort, compareFn] = useSort(fields);

  return (
    <TableSortContext.Provider value={{ activeSort, compareFn, setActiveSort }}>
      {children}
    </TableSortContext.Provider>
  );
};

export const useTableSortContext = () => useContext(TableSortContext);

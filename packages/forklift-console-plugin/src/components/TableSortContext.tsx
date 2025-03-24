import React, { createContext, FC, PropsWithChildren, useContext } from 'react';

import { useSort } from './common/TableView/sort';
import { SortType } from './common/TableView/types';
import { ResourceField } from './common/utils/types';

export type TableSortContextProps = {
  activeSort: SortType;
  setActiveSort: (activeSort: SortType) => void;
  compareFn: (a: unknown, b: unknown) => number;
};

const defaultTableSortContext = {
  activeSort: { isAsc: true, resourceFieldId: undefined, label: '' },
  setActiveSort: () => undefined,
  compareFn: () => undefined,
};

export const TableSortContext = createContext<TableSortContextProps>(defaultTableSortContext);

type TableSortContextProviderProps = PropsWithChildren & {
  fields: ResourceField[];
};

export const TableSortContextProvider: FC<TableSortContextProviderProps> = ({
  fields,
  children,
}) => {
  const [activeSort, setActiveSort, compareFn] = useSort(fields);

  return (
    <TableSortContext.Provider value={{ activeSort, setActiveSort, compareFn }}>
      {children}
    </TableSortContext.Provider>
  );
};

export const useTableSortContext = () => useContext(TableSortContext);

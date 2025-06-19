import { createContext, type FC, type PropsWithChildren, useContext } from 'react';

import { useSort } from './common/TableView/sort';
import type { SortType } from './common/TableView/types';
import type { ResourceField, SortDirection } from './common/utils/types';

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
  defaultSort?: { resourceFieldId: string; direction: SortDirection };
};

export const TableSortContextProvider: FC<TableSortContextProviderProps> = ({
  children,
  defaultSort,
  fields,
}) => {
  const [activeSort, setActiveSort, compareFn] = useSort(fields, 'en', defaultSort);

  return (
    <TableSortContext.Provider value={{ activeSort, compareFn, setActiveSort }}>
      {children}
    </TableSortContext.Provider>
  );
};

export const useTableSortContext = () => useContext(TableSortContext);

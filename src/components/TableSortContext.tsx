import { createContext } from 'react';

import type { SortType } from './common/TableView/types';

export type TableSortContextProps = {
  activeSort: SortType;
  compareFn: (a: unknown, b: unknown) => number;
  setActiveSort: (activeSort: SortType) => void;
};

const defaultTableSortContext = {
  activeSort: { isAsc: true, label: '', resourceFieldId: '' },
  compareFn: () => 0,
  setActiveSort: () => undefined,
};

export const TableSortContext = createContext<TableSortContextProps>(defaultTableSortContext);

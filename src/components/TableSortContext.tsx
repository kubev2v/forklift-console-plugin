import { createContext } from 'react';

import type { SortType } from './common/TableView/types';

export type TableSortContextProps = {
  activeSort: SortType;
  setActiveSort: (activeSort: SortType) => void;
  compareFn: (a: unknown, b: unknown) => number;
};

const defaultTableSortContext = {
  activeSort: { isAsc: true, label: '', resourceFieldId: '' },
  compareFn: () => 0,
  setActiveSort: () => undefined,
};

export const TableSortContext = createContext<TableSortContextProps>(defaultTableSortContext);

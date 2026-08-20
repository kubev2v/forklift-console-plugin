import { createContext } from 'react';

import type { SortType } from './common/TableView/types';

export type TableSortContextProps = {
  activeSort: SortType;
  compareFn: (a: unknown, b: unknown) => number;
  setActiveSort: (activeSort: SortType) => void;
};

const defaultTableSortContext = {
  activeSort: { isAsc: true, label: '', resourceFieldId: '' },
  compareFn: (): number => 0,
  setActiveSort: (): void => undefined,
};

export const TableSortContext = createContext<TableSortContextProps>(defaultTableSortContext);

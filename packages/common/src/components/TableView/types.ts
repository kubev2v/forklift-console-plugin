import { Field, SortType } from '../types';

export interface Column {
  id: string;
  toLabel(t: (key: string) => string): string;
  sortable?: boolean;
}

export interface RowProps<T> {
  columns: Field[];
  entity: T;
  currentNamespace: string;
}

export interface TableViewHeaderProps {
  visibleColumns: Field[];
  activeSort: SortType;
  setActiveSort: (sort: SortType) => void;
}

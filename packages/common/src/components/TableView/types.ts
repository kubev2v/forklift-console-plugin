import { ResourceField, SortType } from '../types';

export interface RowProps<T> {
  resourceFields: ResourceField[];
  resourceData: T;
  currentNamespace: string;
  rowIndex: number;
}

export interface TableViewHeaderProps {
  visibleColumns: ResourceField[];
  activeSort: SortType;
  setActiveSort: (sort: SortType) => void;
}

import { ResourceField, SortType } from '../types';

export interface RowProps<T> {
  resourceFields: ResourceField[];
  resourceData: T;
  resourceIndex: number;
  namespace: string;
}

export interface TableViewHeaderProps {
  visibleColumns: ResourceField[];
  activeSort: SortType;
  setActiveSort: (sort: SortType) => void;
}

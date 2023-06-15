import { ResourceField } from '../../utils';

export interface SortType {
  isAsc: boolean;
  resourceFieldId: string;
  label: string;
}

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

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
  isSelected?: boolean;
  toggleSelect?: () => void;
}

export interface TableViewHeaderProps<T> {
  visibleColumns: ResourceField[];
  activeSort: SortType;
  setActiveSort: (sort: SortType) => void;
  dataOnScreen: T[];
}

import { ResourceField } from '../utils/types';

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
  isExpanded?: boolean;
  toggleSelect?: () => void;
  length?: number;
}

export interface TableViewHeaderProps<T> {
  /**
   * List of visible columns and their properties
   */
  visibleColumns: ResourceField[];
  /**
   * Specify which column is currently used for sorting the table
   * and is it ascending or descending order.
   */
  activeSort: SortType;
  /**
   * A handler for applying the sorting
   */
  setActiveSort: (sort: SortType) => void;
  /**
   * currently visible items on the screen, for handling bulk selection ("select all" checkbox).
   */
  dataOnScreen?: T[];
}

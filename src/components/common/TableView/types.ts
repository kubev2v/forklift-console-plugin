import type { ResourceField } from '../utils/types';

export type SortType = {
  isAsc: boolean;
  label: string | undefined;
  resourceFieldId: string;
};

export type RowProps<T> = {
  isExpanded?: boolean;
  isSelected?: boolean;
  length?: number;
  namespace: string;
  resourceData: T;
  resourceFields: ResourceField[];
  resourceIndex: number;
  toggleSelect?: () => void;
};

export type TableViewHeaderProps<T> = {
  /**
   * Specify which column is currently used for sorting the table
   * and is it ascending or descending order.
   */
  activeSort: SortType;
  /**
   *
   * @param selectedIds
   * @returns
   */
  canSelect?: boolean;
  /**
   * currently visible items on the screen, for handling bulk selection ("select all" checkbox).
   */
  dataOnScreen?: T[];
  /**
   * A handler for applying the sorting
   */
  setActiveSort: (sort: SortType) => void;
  /**
   * List of visible columns and their properties
   */
  visibleColumns: ResourceField[];
};

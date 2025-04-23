import type { StandardPageProps } from './StandardPage';

type WithSelectionProps<T> = Pick<StandardPageProps<T>, 'canSelect'> & {
  isExpanded?: ((item: T) => boolean | undefined) | undefined;
  isSelected?: ((item: T) => boolean | undefined) | undefined;
  toggleSelectFor: (data: T[]) => void;
};

export type WithRowSelectionProps<T> = WithSelectionProps<T> & {
  CellMapper: StandardPageProps<T>['CellMapper'];
  toggleExpandFor: (item: T[]) => void;
};

export type WithHeaderSelectionProps<T> = WithSelectionProps<T> & {
  HeaderMapper: StandardPageProps<T>['HeaderMapper'];
};

export type IdBasedSelectionProps<T> = {
  /**
   * @returns string that can be used as an unique identifier
   */
  toId?: (item: T) => string;

  /**
   * @returns true if items can be selected, false otherwise
   */
  canSelect?: (item: T) => boolean;

  /**
   * onSelect is called when selection changes
   */
  onSelect?: (selectedIds: string[]) => void;

  /**
   * Selected ids
   */
  selectedIds?: string[];

  /**
   * onExpand is called when expand changes
   */
  onExpand?: (expandedIds: string[]) => void;

  /**
   * Expanded ids
   */
  expandedIds?: string[];
};

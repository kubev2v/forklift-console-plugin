import type { StandardPageProps } from './StandardPage';

/** Data source tuple: [data, loaded, error]. */
export type DataSource<T> = [data: T[], loaded: boolean, error: unknown];

type WithSelectionProps<T> = Pick<StandardPageProps<T>, 'canSelect'> & {
  isExpanded?: ((item: T) => boolean | undefined) | undefined;
  isSelected?: ((item: T) => boolean | undefined) | undefined;
  toggleSelectFor: (data: T[]) => void;
};

type WithRowSelectionProps<T> = WithSelectionProps<T> & {
  cell: StandardPageProps<T>['cell'];
  toggleExpandFor: (item: T[]) => void;
};

type WithHeaderSelectionProps<T> = Pick<WithSelectionProps<T>, 'isExpanded'> & {
  header: StandardPageProps<T>['header'];
};

/** ID-based selection/expansion props. Requires toId for unique identifiers. */
type IdBasedSelectionProps<T> = {
  toId?: (item: T) => string;
  canSelect?: (item: T) => boolean;
  onSelect?: (selectedIds: string[]) => void;
  selectedIds?: string[];
  onExpand?: (expandedIds: string[]) => void;
  expandedIds?: string[];
};

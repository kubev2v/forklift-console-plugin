import { type FC, type MutableRefObject, type ReactNode, useMemo, useRef } from 'react';

import type { FilterRenderer, ValueMatcher } from '@components/common/FilterGroup/types';
import type { UserSettings } from '@components/common/Page/types';
import type { RowProps, TableViewHeaderProps } from '@components/common/TableView/types';
import type { GlobalActionToolbarProps, ResourceField } from '@components/common/utils/types';
import { TableSortContext } from '@components/TableSortContext';
import { TableSortContextProvider } from '@components/TableSortContextProvider';
import { useTableSortContext } from '@components/useTableSortContext';

import StandardPageInner from './StandardPageInner';
type StandardPageProps<T> = {
  addButton?: JSX.Element;
  alerts?: ReactNode;
  canSelect?: (item: T) => boolean;
  cell?: FC<RowProps<T>>;

  className?: string;
  customNoResultsFound?: JSX.Element;
  customNoResultsMatchFilter?: JSX.Element;
  dataSource: [data: T[], loaded: boolean, error: unknown];
  expanded?: FC<RowProps<T>>;
  expandedIds?: string[];
  extraSupportedFilters?: Record<string, FilterRenderer>;
  extraSupportedMatchers?: ValueMatcher[];
  fieldsMetadata: ResourceField[];
  GlobalActionToolbarItems?: FC<GlobalActionToolbarProps<T>>[];
  header?: FC<TableViewHeaderProps<T>>;
  namespace?: string;
  noPadding?: boolean;
  onExpand?: (expandedIds: string[]) => void;
  onSelect?: (selectedIds: string[]) => void;
  page?: number;
  pageRef?: MutableRefObject<number>;
  pagination?: number | 'on' | 'off';
  postFilterData?: (
    data: T[],
    selectedFilters: Record<string, string[]>,
    fields: ResourceField[],
  ) => T[];
  row?: FC<RowProps<T>>;
  selectedIds?: string[];
  shouldShowLearningExperienceButton?: boolean;
  showManageColumns?: boolean;
  testId?: string;
  title?: string;
  titleHelpContent?: ReactNode;
  toId?: (item: T) => string;
  userSettings?: UserSettings;
};

const StandardPage = <T,>(pageProps: StandardPageProps<T>) => {
  const sortContext = useTableSortContext();
  const internalPageRef = useRef(pageProps.page ?? 1);
  const pageRef = pageProps.pageRef ?? internalPageRef;

  const defaultFieldsWithoutFilters = useMemo(
    () => pageProps.fieldsMetadata.filter(({ isForFilterOnly }) => !isForFilterOnly),
    [pageProps.fieldsMetadata],
  );

  const defaultSort = useMemo(() => {
    const field = defaultFieldsWithoutFilters.find((fld) => fld.defaultSortDirection);
    return field?.defaultSortDirection && field?.resourceFieldId
      ? { direction: field.defaultSortDirection, resourceFieldId: field.resourceFieldId }
      : undefined;
  }, [defaultFieldsWithoutFilters]);

  const isInSortContext = Boolean(sortContext.activeSort.resourceFieldId);

  if (isInSortContext) {
    return <StandardPageInner {...pageProps} {...sortContext} pageRef={pageRef} />;
  }

  return (
    <TableSortContextProvider defaultSort={defaultSort} fields={defaultFieldsWithoutFilters}>
      <TableSortContext.Consumer>
        {(sortProps) => <StandardPageInner {...pageProps} {...sortProps} pageRef={pageRef} />}
      </TableSortContext.Consumer>
    </TableSortContextProvider>
  );
};

export default StandardPage;

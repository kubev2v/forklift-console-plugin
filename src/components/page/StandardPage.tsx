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
  dataSource: [data: T[], loaded: boolean, error: unknown];
  fieldsMetadata: ResourceField[];
  namespace?: string;
  page?: number;

  addButton?: JSX.Element;
  row?: FC<RowProps<T>>;
  cell?: FC<RowProps<T>>;
  expanded?: FC<RowProps<T>>;
  header?: FC<TableViewHeaderProps<T>>;
  extraSupportedFilters?: Record<string, FilterRenderer>;
  extraSupportedMatchers?: ValueMatcher[];
  postFilterData?: (
    data: T[],
    selectedFilters: Record<string, string[]>,
    fields: ResourceField[],
  ) => T[];
  customNoResultsFound?: JSX.Element;
  customNoResultsMatchFilter?: JSX.Element;
  pagination?: number | 'on' | 'off';
  userSettings?: UserSettings;
  alerts?: ReactNode;
  GlobalActionToolbarItems?: FC<GlobalActionToolbarProps<T>>[];
  className?: string;
  toId?: (item: T) => string;
  canSelect?: (item: T) => boolean;
  onSelect?: (selectedIds: string[]) => void;
  selectedIds?: string[];
  onExpand?: (expandedIds: string[]) => void;
  expandedIds?: string[];
  pageRef?: MutableRefObject<number>;
  showManageColumns?: boolean;
  title?: string;
  titleHelpContent?: ReactNode;
  noPadding?: boolean;
  testId?: string;
};

const StandardPage = <T,>(pageProps: StandardPageProps<T>) => {
  const sortContext = useTableSortContext();
  const internalPageRef = useRef(pageProps.page ?? 1);
  const pageRef = pageProps.pageRef ?? internalPageRef;

  const defaultSort = useMemo(() => {
    const field = pageProps.fieldsMetadata.find((fld) => fld.defaultSortDirection);
    return field?.defaultSortDirection && field?.resourceFieldId
      ? { direction: field.defaultSortDirection, resourceFieldId: field.resourceFieldId }
      : undefined;
  }, [pageProps.fieldsMetadata]);

  const isInSortContext = Boolean(sortContext.activeSort.resourceFieldId);

  if (isInSortContext) {
    return <StandardPageInner {...pageProps} {...sortContext} pageRef={pageRef} />;
  }

  return (
    <TableSortContextProvider fields={pageProps.fieldsMetadata} defaultSort={defaultSort}>
      <TableSortContext.Consumer>
        {(sortProps) => <StandardPageInner {...pageProps} {...sortProps} pageRef={pageRef} />}
      </TableSortContext.Consumer>
    </TableSortContextProvider>
  );
};

export default StandardPage;

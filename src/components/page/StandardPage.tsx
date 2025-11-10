import type { FC, MutableRefObject, ReactNode } from 'react';
import { useMemo, useRef } from 'react';

import type { FilterRenderer, ValueMatcher } from '@components/common/FilterGroup/types';
import type { UserSettings } from '@components/common/Page/types';
import { useFields } from '@components/common/Page/useFields';
import { DefaultHeader } from '@components/common/TableView/DefaultHeader';
import { DefaultRow } from '@components/common/TableView/DefaultRow';
import type { RowProps, TableViewHeaderProps } from '@components/common/TableView/types';
import { withTr } from '@components/common/TableView/withTr';
import type { GlobalActionToolbarProps, ResourceField } from '@components/common/utils/types';
import { TableSortContext, type TableSortContextProps } from '@components/TableSortContext';
import { TableSortContextProvider } from '@components/TableSortContextProvider';
import { useTableSortContext } from '@components/useTableSortContext';
import { PageSection } from '@patternfly/react-core';

import { PageContent } from './components/PageContent';
import { PageHeader } from './components/PageHeader';
import { PageTable } from './components/PageTable';
import { PageToolbar } from './components/PageToolbar';
import { usePageData } from './hooks/usePageData';
import { usePageFilters } from './hooks/usePageFilters';
import { usePagination } from './hooks/usePagination';
import type { DataSource } from './types';

import './StandardPage.style.css';

export type StandardPageProps<T> = {
  dataSource: DataSource<T>;
  fieldsMetadata: ResourceField[];
  namespace: string;
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

type StandardPageInnerProps<T> = Omit<StandardPageProps<T>, 'pageRef'> &
  TableSortContextProps &
  Required<Pick<StandardPageProps<T>, 'pageRef'>>;

const StandardPageInner = <T,>({
  activeSort,
  addButton,
  alerts,
  cell,
  className,
  compareFn,
  customNoResultsFound,
  customNoResultsMatchFilter,
  dataSource: [flatData, loaded, error],
  expanded,
  expandedIds,
  extraSupportedFilters,
  extraSupportedMatchers,
  fieldsMetadata,
  GlobalActionToolbarItems = [],
  header = DefaultHeader<T>,
  namespace,
  noPadding,
  onSelect,
  page: initialPage = 1,
  pageRef,
  pagination,
  postFilterData,
  row = DefaultRow<T>,
  selectedIds,
  setActiveSort,
  showManageColumns = true,
  testId,
  title,
  titleHelpContent,
  toId,
  userSettings,
}: StandardPageInnerProps<T>) => {
  const { clearAllFilters, metaMatcher, selectedFilters, setSelectedFilters, supportedFilters } =
    usePageFilters({
      extraSupportedFilters,
      extraSupportedMatchers,
      fieldsMetadata,
      userSettings,
    });

  const [fields, setFields] = useFields(namespace, fieldsMetadata, userSettings?.fields);

  const { finalFilteredData, sortedData } = usePageData({
    compareFn,
    error,
    fields,
    flatData,
    loaded,
    metaMatcher,
    postFilterData,
    selectedFilters,
  });

  const { itemsPerPage, onPerPageSelect, onSetPage, page, pageData, showPagination } =
    usePagination({
      finalFilteredData,
      initialPage,
      pageRef,
      pagination,
      selectedFilters,
      sortedDataLength: sortedData.length,
      userSettings: userSettings?.pagination,
    });

  const visibleColumns = useMemo(
    () => fields.filter(({ isHidden, isVisible }) => isVisible && !isHidden),
    [fields],
  );

  const RowComponent = cell ? withTr(cell, expanded) : row;

  const dataOnScreen = useMemo(
    () => (showPagination ? pageData : finalFilteredData),
    [showPagination, pageData, finalFilteredData],
  );

  const dataIds = useMemo(
    () => finalFilteredData?.map((data) => toId?.(data) ?? ''),
    [finalFilteredData, toId],
  );

  const pageDataIds = useMemo(() => pageData?.map((data) => toId?.(data) ?? ''), [pageData, toId]);

  const renderedGlobalActions = useMemo(
    () =>
      GlobalActionToolbarItems.map((Action, index) => (
        <Action key={`${Action.name}-${index}`} dataOnScreen={dataOnScreen} />
      )),
    [GlobalActionToolbarItems, dataOnScreen],
  );

  return (
    <span className={className} data-testid={testId}>
      <PageHeader title={title} titleHelpContent={titleHelpContent} actionButton={addButton} />

      {alerts && <PageSection hasBodyWrapper={false}>{alerts}</PageSection>}

      <PageContent
        toolbar={
          <PageToolbar
            fields={fields}
            flatData={flatData}
            sortedData={sortedData}
            selectedFilters={selectedFilters}
            setSelectedFilters={setSelectedFilters}
            supportedFilters={supportedFilters}
            clearAllFilters={clearAllFilters}
            fieldsMetadata={fieldsMetadata}
            setFields={setFields}
            showManageColumns={showManageColumns}
            showPagination={showPagination}
            page={page}
            itemsPerPage={itemsPerPage}
            totalItems={finalFilteredData.length}
            onSetPage={onSetPage}
            onPerPageSelect={onPerPageSelect}
            selectedIds={selectedIds}
            dataIds={dataIds}
            pageDataIds={pageDataIds}
            onSelect={onSelect}
            renderedGlobalActions={renderedGlobalActions}
          />
        }
        showPagination={showPagination}
        page={page}
        itemsPerPage={itemsPerPage}
        totalItems={finalFilteredData.length}
        onSetPage={onSetPage}
        onPerPageSelect={onPerPageSelect}
        noPadding={noPadding}
      >
        <PageTable
          dataOnScreen={dataOnScreen}
          loaded={loaded}
          error={error}
          sortedData={sortedData}
          finalFilteredData={finalFilteredData}
          visibleColumns={visibleColumns}
          namespace={namespace}
          title={title}
          RowComponent={RowComponent}
          header={header}
          toId={toId}
          expandedIds={expandedIds}
          customNoResultsFound={customNoResultsFound}
          customNoResultsMatchFilter={customNoResultsMatchFilter}
          clearAllFilters={clearAllFilters}
          activeSort={activeSort}
          setActiveSort={setActiveSort}
          compareFn={compareFn}
        />
      </PageContent>
    </span>
  );
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

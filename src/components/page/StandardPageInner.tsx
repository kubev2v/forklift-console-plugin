import { type ComponentProps, useMemo } from 'react';

import { useFields } from '@components/common/Page/useFields';
import { DefaultHeader } from '@components/common/TableView/DefaultHeader';
import { DefaultRow } from '@components/common/TableView/DefaultRow';
import { withTr } from '@components/common/TableView/withTr';
import type { TableSortContextProps } from '@components/TableSortContext';
import { PageSection } from '@patternfly/react-core';

import { PageContent } from './components/PageContent';
import { PageHeader } from './components/PageHeader';
import { PageTable } from './components/PageTable';
import { PageToolbar } from './components/PageToolbar';
import { usePageData } from './hooks/usePageData';
import { usePageFilters } from './hooks/usePageFilters';
import { usePagination } from './hooks/usePagination';
import type StandardPage from './StandardPage';

import './StandardPage.style.css';

type StandardPageInnerProps<T> = Omit<ComponentProps<typeof StandardPage<T>>, 'pageRef'> &
  TableSortContextProps &
  Required<Pick<ComponentProps<typeof StandardPage<T>>, 'pageRef'>>;

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
  namespace = '',
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

export default StandardPageInner;

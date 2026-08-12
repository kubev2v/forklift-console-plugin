/* eslint-disable max-lines-per-function */
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
import { getVisibleColumns } from './utils/utils';
import type StandardPage from './StandardPage';

import './StandardPage.style.css';

type StandardPageInnerProps<T> = Omit<ComponentProps<typeof StandardPage<T>>, 'pageRef'> &
  TableSortContextProps &
  Required<Pick<ComponentProps<typeof StandardPage<T>>, 'pageRef'>>;

const StandardPageInner = <T,>({
  activeSort,
  addButton,
  alerts,
  canSelect,
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
  shouldShowLearningExperienceButton = false,
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

  const defaultFieldsWithoutFilters = useMemo(
    () => fieldsMetadata.filter(({ isForFilterOnly }) => !isForFilterOnly),
    [fieldsMetadata],
  );

  const [fields, setFields] = useFields(
    namespace,
    defaultFieldsWithoutFilters,
    userSettings?.fields,
  );

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

  const visibleColumns = useMemo(() => getVisibleColumns(fields), [fields]);

  const RowComponent = cell ? withTr(cell, expanded) : row;

  const dataOnScreen = useMemo(
    () => (showPagination ? pageData : finalFilteredData),
    [showPagination, pageData, finalFilteredData],
  );

  const dataIds = useMemo(
    () =>
      finalFilteredData
        ?.filter((item) => canSelect?.(item) ?? true)
        .map((data) => toId?.(data) ?? ''),
    [finalFilteredData, toId, canSelect],
  );

  const pageDataIds = useMemo(
    () => pageData?.filter((item) => canSelect?.(item) ?? true).map((data) => toId?.(data) ?? ''),
    [pageData, toId, canSelect],
  );

  const renderedGlobalActions = useMemo(
    () =>
      GlobalActionToolbarItems.map((Action, index) => (
        <Action dataOnScreen={dataOnScreen} key={`${Action.name}-${index}`} />
      )),
    [GlobalActionToolbarItems, dataOnScreen],
  );

  return (
    <span className={className} data-testid={testId}>
      <PageHeader
        actionButton={addButton}
        shouldShowLearningExperienceButton={shouldShowLearningExperienceButton}
        title={title}
        titleHelpContent={titleHelpContent}
      />

      {alerts && <PageSection hasBodyWrapper={false}>{alerts}</PageSection>}

      <PageContent
        itemsPerPage={itemsPerPage}
        noPadding={noPadding}
        onPerPageSelect={onPerPageSelect}
        onSetPage={onSetPage}
        page={page}
        showPagination={showPagination}
        toolbar={
          <PageToolbar
            clearAllFilters={clearAllFilters}
            dataIds={dataIds}
            defaultFieldsWithoutFilters={defaultFieldsWithoutFilters}
            fields={fields}
            fieldsMetadata={fieldsMetadata}
            flatData={flatData}
            itemsPerPage={itemsPerPage}
            onPerPageSelect={onPerPageSelect}
            onSelect={onSelect}
            onSetPage={onSetPage}
            page={page}
            pageDataIds={pageDataIds}
            renderedGlobalActions={renderedGlobalActions}
            selectedFilters={selectedFilters}
            selectedIds={selectedIds}
            setFields={setFields}
            setSelectedFilters={setSelectedFilters}
            showManageColumns={showManageColumns}
            showPagination={showPagination}
            sortedData={sortedData}
            supportedFilters={supportedFilters}
            totalItems={finalFilteredData.length}
          />
        }
        totalItems={finalFilteredData.length}
      >
        <PageTable
          activeSort={activeSort}
          clearAllFilters={clearAllFilters}
          compareFn={compareFn}
          customNoResultsFound={customNoResultsFound}
          customNoResultsMatchFilter={customNoResultsMatchFilter}
          dataOnScreen={dataOnScreen}
          error={error}
          expandedIds={expandedIds}
          finalFilteredData={finalFilteredData}
          header={header}
          loaded={loaded}
          namespace={namespace}
          RowComponent={RowComponent}
          setActiveSort={setActiveSort}
          sortedData={sortedData}
          title={title}
          toId={toId}
          visibleColumns={visibleColumns}
        />
      </PageContent>
    </span>
  );
};

export default StandardPageInner;

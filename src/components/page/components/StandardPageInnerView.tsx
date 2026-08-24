import type { ReactElement } from 'react';

import { PageSection } from '@patternfly/react-core';

import { PageContent } from './PageContent';
import { PageHeader } from './PageHeader';
import { PageTable } from './PageTable';
import { PageToolbar } from './PageToolbar';
import type { StandardPageInnerViewProps } from './standardPageInnerView.types';

const StandardPageInnerView = <T,>({
  activeSort,
  addButton,
  alerts,
  className,
  clearAllFilters,
  customNoResultsFound,
  customNoResultsMatchFilter,
  dataIds,
  dataOnScreen,
  defaultFieldsWithoutFilters,
  error,
  expandedIds,
  fields,
  fieldsMetadata,
  finalFilteredData,
  flatData,
  header,
  itemsPerPage,
  loaded,
  namespace,
  noPadding,
  onPerPageSelect,
  onSelect,
  onSetPage,
  page,
  pageDataIds,
  renderedGlobalActions,
  RowComponent,
  selectedFilters,
  selectedIds,
  setActiveSort,
  setFields,
  setSelectedFilters,
  shouldShowLearningExperienceButton,
  showManageColumns,
  showPagination,
  sortedData,
  supportedFilters,
  testId,
  title,
  titleHelpContent,
  toId,
  visibleColumns,
}: StandardPageInnerViewProps<T>): ReactElement => (
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

export default StandardPageInnerView;

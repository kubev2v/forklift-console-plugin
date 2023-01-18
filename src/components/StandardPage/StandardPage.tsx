import React, { useMemo } from 'react';
import {
  AttributeValueFilter,
  createMetaMatcher,
  EnumFilter,
  FilterTypeProps,
  FreetextFilter,
  GroupedEnumFilter,
  PrimaryFilters,
  toFieldFilter,
  useUrlFilters,
} from 'src/components/Filter';
import { ManageColumnsToolbar, RowProps, TableView, useSort } from 'src/components/TableView';
import { Field } from 'src/components/types';
import { useTranslation } from 'src/utils/i18n';

import {
  Level,
  LevelItem,
  PageSection,
  Pagination,
  Title,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  ToolbarToggleGroup,
} from '@patternfly/react-core';
import { FilterIcon } from '@patternfly/react-icons';

import { ErrorState, Loading, NoResultsFound, NoResultsMatchFilter } from './ResultStates';
import { UserSettings } from './types';
import { useFields } from './useFields';
import { DEFAULT_PER_PAGE, usePagination } from './usePagination';

/**
 * @param T type to be displayed in the list
 */
export interface StandardPageProps<T> {
  /**
   * Component displayed close to the top right corner. By convention it's usually "add" or "create" button.
   */
  addButton?: JSX.Element;
  /**
   * Source of data. Tuple should consist of:
   * @param T[] array of items
   * @param loading flag that indicates if loading is in progress
   * @param error flag indicating error
   */
  dataSource: [T[], boolean, boolean];
  /**
   * Fields to be displayed (from the provided type T).
   */
  fieldsMetadata: Field[];
  /**
   * Currently used namespace.
   */
  namespace: string;
  /**
   * Maps entity of type T to a table row.
   */
  RowMapper: React.FunctionComponent<RowProps<T>>;
  /**
   * Filter types that will be used.
   * Default are: EnumFilter and FreetextFilter
   */
  supportedFilters?: {
    [type: string]: (props: FilterTypeProps) => JSX.Element;
  };
  title: string;
  /**
   * Information displayed when the data source returned no items.
   */
  customNoResultsFound?: JSX.Element;
  /**
   * Information displayed when the data source returned some items but due to applied filters no items can be shown.
   */
  customNoResultsMatchFilter?: JSX.Element;

  /**
   * 1. 'on' - always show pagination controls
   * 2. 'off' - disable
   * 3.  auto -  display if unfiltered number of items is greater than provided threshold
   *
   * Default value: 10
   */
  pagination?: number | 'on' | 'off';

  /**
   * Prefix for filters stored in the query params part of the URL.
   * By default no prefix is used - the field ID is used directly.
   */
  filterPrefix?: string;

  /**
   * User settings store to initialize the page according to user preferences.
   */
  userSettings?: UserSettings;
}

/**
 * Standard list page.
 */
export function StandardPage<T>({
  namespace,
  dataSource: [flattenData, loaded, error],
  RowMapper,
  title,
  addButton,
  fieldsMetadata,
  supportedFilters = {
    enum: EnumFilter,
    freetext: FreetextFilter,
    groupedEnum: GroupedEnumFilter,
  },
  customNoResultsFound,
  customNoResultsMatchFilter,
  pagination = DEFAULT_PER_PAGE,
  userSettings,
  filterPrefix = '',
}: StandardPageProps<T>) {
  const { t } = useTranslation();
  const [selectedFilters, setSelectedFilters] = useUrlFilters({
    fields: fieldsMetadata,
    filterPrefix,
  });
  const clearAllFilters = () => setSelectedFilters({});
  const [fields, setFields] = useFields(namespace, fieldsMetadata, userSettings?.fields);
  const [activeSort, setActiveSort, comparator] = useSort(fields);

  const filteredData = useMemo(
    () => flattenData.filter(createMetaMatcher(selectedFilters, fields)).sort(comparator),
    [flattenData, selectedFilters, fields, comparator],
  );

  const { pageData, showPagination, itemsPerPage, currentPage, setPage, setPerPage } =
    usePagination({
      pagination,
      filteredData,
      flattenData,
      userSettings: userSettings?.pagination,
    });

  const errorFetchingData = loaded && error;
  const noResults = loaded && !error && flattenData.length == 0;
  const noMatchingResults = loaded && !error && filteredData.length === 0 && flattenData.length > 0;

  return (
    <>
      <PageSection variant="light">
        <Level>
          <LevelItem>
            <Title headingLevel="h1">{title}</Title>
          </LevelItem>
          {addButton && <LevelItem>{addButton}</LevelItem>}
        </Level>
      </PageSection>
      <PageSection>
        <Toolbar clearAllFilters={clearAllFilters} clearFiltersButtonText={t('Clear all filters')}>
          <ToolbarContent>
            <ToolbarToggleGroup toggleIcon={<FilterIcon />} breakpoint="xl">
              <PrimaryFilters
                fieldFilters={fields.filter((field) => field.filter?.primary).map(toFieldFilter)}
                onFilterUpdate={setSelectedFilters}
                selectedFilters={selectedFilters}
                supportedFilterTypes={supportedFilters}
              />
              <AttributeValueFilter
                fieldFilters={fields
                  .filter(({ filter }) => filter && !filter.primary)
                  .map(toFieldFilter)}
                onFilterUpdate={setSelectedFilters}
                selectedFilters={selectedFilters}
                supportedFilterTypes={supportedFilters}
              />
              <ManageColumnsToolbar
                columns={fields}
                defaultColumns={fieldsMetadata}
                setColumns={setFields}
              />
            </ToolbarToggleGroup>
            {showPagination && (
              <ToolbarItem variant="pagination">
                <Pagination
                  variant="top"
                  perPage={itemsPerPage}
                  page={currentPage}
                  itemCount={filteredData.length}
                  onSetPage={(even, page) => setPage(page)}
                  onPerPageSelect={(even, perPage, page) => {
                    setPerPage(perPage);
                    setPage(page);
                  }}
                />
              </ToolbarItem>
            )}
          </ToolbarContent>
        </Toolbar>
        <TableView<T>
          entities={showPagination ? pageData : filteredData}
          visibleColumns={fields.filter(({ isVisible }) => isVisible)}
          aria-label={title}
          Row={RowMapper}
          activeSort={activeSort}
          setActiveSort={setActiveSort}
          currentNamespace={namespace}
        >
          {!loaded && <Loading key="loading" />}
          {errorFetchingData && <ErrorState key="error" />}
          {noResults && (customNoResultsFound ?? <NoResultsFound key="no_result" />)}
          {noMatchingResults &&
            (customNoResultsMatchFilter ?? (
              <NoResultsMatchFilter key="no_match" clearAllFilters={clearAllFilters} />
            ))}
        </TableView>
        {showPagination && (
          <Pagination
            variant="bottom"
            perPage={itemsPerPage}
            page={currentPage}
            itemCount={filteredData.length}
            onSetPage={(event, page) => setPage(page)}
            onPerPageSelect={(event, perPage, page) => {
              setPerPage(perPage);
              setPage(page);
            }}
          />
        )}
      </PageSection>
    </>
  );
}

export default StandardPage;

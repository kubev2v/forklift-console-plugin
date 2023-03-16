import React, { useMemo } from 'react';
import {
  AttributeValueFilter,
  createMetaMatcher,
  defaultSupportedFilters,
  defaultValueMatchers,
  FilterGroup,
  FilterRenderer,
  toFieldFilter,
  useUrlFilters,
  ValueMatcher,
} from 'common/src/components/Filter';
import {
  DefaultHeader,
  ManageColumnsToolbar,
  RowProps,
  TableView,
  TableViewHeaderProps,
  useSort,
} from 'common/src/components/TableView';
import { ResourceField } from 'common/src/components/types';
import { useTranslation } from 'common/src/utils/i18n';

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
 * Reduce two list of filters to one list.
 *
 * @param extraFilters filters we want to use to add or override the default list
 * @param defaultFilters a default list of filters
 * @returns a list containing the default filters plus the extra ones, if an extra filter
 *          already exist in the default list, the extra filter will override the default one.
 */
const reduceValueFilters = (
  extraFilters: ValueMatcher[],
  defaultFilters: ValueMatcher[],
): ValueMatcher[] => {
  const filters = [...extraFilters, ...defaultFilters].reduce((acc, filter) => {
    const accFilterTypes = acc.map((matcher) => matcher.filterType);
    const filterTypeFound = accFilterTypes.includes(filter.filterType);

    if (!filterTypeFound) {
      acc.push(filter);
    }

    return acc;
  }, [] as ValueMatcher[]);

  return filters;
};

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
   * @param error an error object/message/flag, undefined o/w
   */
  dataSource: [T[], boolean, unknown];
  /**
   * Fields to be displayed (from the provided type T).
   */
  fieldsMetadata: ResourceField[];
  /**
   * Currently used namespace.
   */
  namespace: string;
  /**
   * Maps resourceData of type T to a table row.
   */
  RowMapper: React.FunctionComponent<RowProps<T>>;

  /**
   * (optional) Maps field list to table header.
   * Defaults to all visible fields.
   */
  HeaderMapper?: (props: TableViewHeaderProps) => JSX.Element;

  /**
   * Filter types that will be used.
   * Default are: EnumFilter and FreetextFilter
   */
  extraSupportedFilters?: {
    [type: string]: FilterRenderer;
  };

  /**
   * Extract value from fields and compare to selected filter.
   * The default matchers support the default filters.
   */
  extraSupportedMatchers?: ValueMatcher[];

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
  dataSource: [flatData, loaded, error],
  RowMapper,
  title,
  addButton,
  fieldsMetadata,
  extraSupportedFilters,
  customNoResultsFound,
  customNoResultsMatchFilter,
  pagination = DEFAULT_PER_PAGE,
  userSettings,
  filterPrefix = '',
  extraSupportedMatchers,
  HeaderMapper = DefaultHeader,
}: StandardPageProps<T>) {
  const { t } = useTranslation();
  const [selectedFilters, setSelectedFilters] = useUrlFilters({
    fields: fieldsMetadata,
    filterPrefix,
  });
  const clearAllFilters = () => setSelectedFilters({});
  const [fields, setFields] = useFields(namespace, fieldsMetadata, userSettings?.fields);
  const [activeSort, setActiveSort, compareFn] = useSort(fields);

  const supportedMatchers = extraSupportedMatchers
    ? reduceValueFilters(extraSupportedMatchers, defaultValueMatchers)
    : defaultValueMatchers;
  const supportedFilters = extraSupportedFilters
    ? { ...defaultSupportedFilters, ...extraSupportedFilters }
    : defaultSupportedFilters;

  const filteredData = useMemo(
    () =>
      flatData
        .filter(createMetaMatcher(selectedFilters, fields, supportedMatchers))
        .sort(compareFn),
    [flatData, selectedFilters, fields, compareFn],
  );

  const { pageData, showPagination, itemsPerPage, currentPage, setPage, setPerPage } =
    usePagination({
      pagination,
      filteredData,
      flattenData: flatData,
      userSettings: userSettings?.pagination,
    });

  const errorFetchingData = loaded && error;
  const noResults = loaded && !error && flatData.length == 0;
  const noMatchingResults = loaded && !error && filteredData.length === 0 && flatData.length > 0;

  const primaryFilters = fields.filter((field) => field.filter?.primary).map(toFieldFilter);

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
              {primaryFilters.length > 0 && (
                <FilterGroup
                  fieldFilters={primaryFilters}
                  onFilterUpdate={setSelectedFilters}
                  selectedFilters={selectedFilters}
                  supportedFilterTypes={supportedFilters}
                />
              )}
              <AttributeValueFilter
                fieldFilters={fields
                  .filter(({ filter }) => filter && !filter.primary && !filter.standalone)
                  .map(toFieldFilter)}
                onFilterUpdate={setSelectedFilters}
                selectedFilters={selectedFilters}
                supportedFilterTypes={supportedFilters}
              />
              {!!fields.find((field) => field.filter?.standalone) && (
                <FilterGroup
                  fieldFilters={fields
                    .filter((field) => field.filter?.standalone)
                    .map(toFieldFilter)}
                  onFilterUpdate={setSelectedFilters}
                  selectedFilters={selectedFilters}
                  supportedFilterTypes={supportedFilters}
                />
              )}
              <ManageColumnsToolbar
                resourceFields={fields}
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
          visibleColumns={fields.filter(({ isVisible, isHidden }) => isVisible && !isHidden)}
          aria-label={title}
          Row={RowMapper}
          Header={HeaderMapper}
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

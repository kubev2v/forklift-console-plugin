import React, { FC, ReactNode, useMemo } from 'react';
import { useForkliftTranslation } from 'src/utils/i18n';

import {
  AttributeValueFilter,
  createMetaMatcher,
  DEFAULT_PER_PAGE,
  DefaultHeader,
  DefaultRow,
  defaultSupportedFilters,
  defaultValueMatchers,
  ErrorState,
  FilterGroup,
  FilterRenderer,
  GlobalActionToolbarProps,
  Loading,
  NoResultsFound,
  NoResultsMatchFilter,
  ResourceField,
  RowProps,
  TableView,
  TableViewHeaderProps,
  toFieldFilter,
  useFields,
  usePagination,
  UserSettings,
  useSort,
  useUrlFilters,
  ValueMatcher,
  withTr,
} from '@kubev2v/common';
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

import { ManageColumnsToolbar } from './ManageColumnsToolbar';

import './StandardPage.style.css';

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
 * Properties for the `StandardPage` component.
 * These properties define the configuration and behavior of the standard list page.
 *
 * @typedef {Object} StandardPageProps
 * @property {string} namespace - The namespace in which the data resides.
 * @property {[T[], boolean, unknown]} dataSource - The data source tuple consisting of an array of items, a loading flag, and an error object.
 * @property {FC<RowProps<T>>} [RowMapper=DefaultRow<T>] - Optional component to map resource data to a table row.
 * @property {FC<RowProps<T>>} [CellMapper] - Optional component to map resource data to individual cells within a row.
 * @property {string} title - The title displayed at the top of the page.
 * @property {JSX.Element} [addButton] - Optional element to display as an "add" or "create" button.
 * @property {ResourceField[]} fieldsMetadata - Metadata for the fields to be displayed.
 * @property {{ [type: string]: FilterRenderer }} [extraSupportedFilters] - Optional additional filter types.
 * @property {JSX.Element} [customNoResultsFound] - Optional custom message to display when no results are found.
 * @property {JSX.Element} [customNoResultsMatchFilter] - Optional custom message to display when no results match the filter.
 * @property {number | 'on' | 'off'} [pagination=DEFAULT_PER_PAGE] - Controls the display of pagination controls.
 * @property {string} [filterPrefix=''] - Prefix for filters stored in the query params part of the URL.
 * @property {UserSettings} [userSettings] - User settings store to initialize the page according to user preferences.
 * @property {ReactNode} [alerts] - Optional alerts section below the page title.
 * @property {FC<GlobalActionToolbarProps<T>>[]} [GlobalActionToolbarItems=[]] - Optional toolbar items with global actions.
 *
 * @template T - The type of the items being displayed in the table.
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
   * (optional) Maps resourceData of type T to a table row.
   * Defaults to rendering values as strings.
   */
  RowMapper?: FC<RowProps<T>>;

  /**
   * (optional) Maps entity to a list of cells (without wrapping them in <Tr>).
   * If present, it is used instead of RowMapper.
   */
  CellMapper?: FC<RowProps<T>>;

  /**
   * (optional) Maps field list to table header.
   * Defaults to all visible fields.
   */
  HeaderMapper?: FC<TableViewHeaderProps<T>>;

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

  /**
   * Alerts section below the page title
   */
  alerts?: ReactNode;

  /**
   * Toolbar items with global actions.
   */
  GlobalActionToolbarItems?: FC<GlobalActionToolbarProps<T>>[];

  /**
   * className
   */
  className?: string;
}

/**
 * Standard list page component.
 * This component renders a list view with filtering, sorting, and pagination capabilities.
 * It supports custom renderers for rows and headers, as well as global actions.
 *
 * @param {StandardPageProps<T>} props - The properties passed to the component.
 * @param {string} props.namespace - The namespace in which the data resides.
 * @param {T[]} props.dataSource - The data source tuple consisting of an array of items, a loading flag, and an error object.
 * @param {FC<RowProps<T>>} [props.RowMapper=DefaultRow<T>] - Optional component to map resource data to a table row.
 * @param {FC<RowProps<T>>} [props.CellMapper] - Optional component to map resource data to individual cells within a row.
 * @param {string} props.title - The title displayed at the top of the page.
 * @param {JSX.Element} [props.addButton] - Optional element to display as an "add" or "create" button.
 * @param {ResourceField[]} props.fieldsMetadata - Metadata for the fields to be displayed.
 * @param {{ [type: string]: FilterRenderer }} [props.extraSupportedFilters] - Optional additional filter types.
 * @param {JSX.Element} [props.customNoResultsFound] - Optional custom message to display when no results are found.
 * @param {JSX.Element} [props.customNoResultsMatchFilter] - Optional custom message to display when no results match the filter.
 * @param {number | 'on' | 'off'} [props.pagination=DEFAULT_PER_PAGE] - Controls the display of pagination controls.
 * @param {string} [props.filterPrefix=''] - Prefix for filters stored in the query params part of the URL.
 * @param {UserSettings} [props.userSettings] - User settings store to initialize the page according to user preferences.
 * @param {ReactNode} [props.alerts] - Optional alerts section below the page title.
 * @param {FC<GlobalActionToolbarProps<T>>[]} [props.GlobalActionToolbarItems=[]] - Optional toolbar items with global actions.
 *
 * @template T - The type of the items being displayed in the table.
 *
 * @example
 * <StandardPage
 *   namespace="my-namespace"
 *   dataSource={[myData, false, null]}
 *   title="My List"
 *   fieldsMetadata={myFieldsMetadata}
 *   // ...other props
 * />
 */
export function StandardPage<T>({
  namespace,
  dataSource: [flatData, loaded, error],
  RowMapper = DefaultRow<T>,
  CellMapper,
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
  HeaderMapper = DefaultHeader<T>,
  GlobalActionToolbarItems = [],
  alerts,
  className,
}: StandardPageProps<T>) {
  const {
    t,
    i18n: { resolvedLanguage },
  } = useForkliftTranslation();
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

  const primaryFilters = fields
    .filter((field) => field.filter?.primary)
    .map(toFieldFilter(flatData));

  return (
    <span className={className}>
      {title && (
        <PageSection variant="light" className="forklift-page__main-title">
          <Level>
            <LevelItem>
              <Title headingLevel="h1">{title}</Title>
            </LevelItem>
            {addButton && <LevelItem>{addButton}</LevelItem>}
          </Level>
        </PageSection>
      )}
      {alerts && <PageSection variant="light">{alerts}</PageSection>}
      <PageSection variant="light">
        <Toolbar clearAllFilters={clearAllFilters} clearFiltersButtonText={t('Clear all filters')}>
          <ToolbarContent>
            <ToolbarToggleGroup toggleIcon={<FilterIcon />} breakpoint="xl">
              {primaryFilters.length > 0 && (
                <FilterGroup
                  fieldFilters={primaryFilters}
                  onFilterUpdate={setSelectedFilters}
                  selectedFilters={selectedFilters}
                  supportedFilterTypes={supportedFilters}
                  resolvedLanguage={resolvedLanguage}
                />
              )}
              <AttributeValueFilter
                fieldFilters={fields
                  .filter(({ filter }) => filter && !filter.primary && !filter.standalone)
                  .map(toFieldFilter(flatData))}
                onFilterUpdate={setSelectedFilters}
                selectedFilters={selectedFilters}
                supportedFilterTypes={supportedFilters}
                resolvedLanguage={resolvedLanguage}
              />
              {!!fields.find((field) => field.filter?.standalone) && (
                <FilterGroup
                  fieldFilters={fields
                    .filter((field) => field.filter?.standalone)
                    .map(toFieldFilter(flatData))}
                  onFilterUpdate={setSelectedFilters}
                  selectedFilters={selectedFilters}
                  supportedFilterTypes={supportedFilters}
                  resolvedLanguage={resolvedLanguage}
                />
              )}
              <ManageColumnsToolbar
                resourceFields={fields}
                defaultColumns={fieldsMetadata}
                setColumns={setFields}
              />
              {GlobalActionToolbarItems?.length > 0 &&
                GlobalActionToolbarItems.map((Action, index) => (
                  <Action key={index} dataOnScreen={showPagination ? pageData : filteredData} />
                ))}
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
          Row={CellMapper ? withTr(CellMapper) : RowMapper}
          Header={HeaderMapper}
          activeSort={activeSort}
          setActiveSort={setActiveSort}
          currentNamespace={namespace}
        >
          {!loaded && <Loading key="loading" title={t('Loading')} />}
          {errorFetchingData && <ErrorState key="error" title={t('Unable to retrieve data')} />}
          {noResults &&
            (customNoResultsFound ?? (
              <NoResultsFound key="no_result" title={t('No results found')} />
            ))}
          {noMatchingResults &&
            (customNoResultsMatchFilter ?? (
              <NoResultsMatchFilter
                key="no_match"
                clearAllFilters={clearAllFilters}
                title={t('No results found')}
                description={t(
                  'No results match the filter criteria. Clear all filters and try again.',
                )}
                clearAllLabel={t('Clear all filters')}
              />
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
    </span>
  );
}

export default StandardPage;

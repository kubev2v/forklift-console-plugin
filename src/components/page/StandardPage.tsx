import { type FC, type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useForkliftTranslation } from 'src/utils/i18n';

import TableBulkSelect from '@components/TableBulkSelect';
import {
  Level,
  LevelItem,
  type OnPerPageSelect,
  type OnSetPage,
  PageSection,
  Pagination,
  Split,
  Title,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  ToolbarToggleGroup,
} from '@patternfly/react-core';
import { FilterIcon } from '@patternfly/react-icons';
import { isEmpty } from '@utils/helpers';

import { AttributeValueFilter } from '../common/FilterGroup/AttributeValueFilter';
import { FilterGroup } from '../common/FilterGroup/FilterGroup';
import { toFieldFilter } from '../common/FilterGroup/helpers';
import {
  createMetaMatcher,
  defaultSupportedFilters,
  defaultValueMatchers,
} from '../common/FilterGroup/matchers';
import type { FilterRenderer, ValueMatcher } from '../common/FilterGroup/types';
import { useUrlFilters } from '../common/FilterGroup/useUrlFilters';
import {
  ErrorState,
  Loading,
  NoResultsFound,
  NoResultsMatchFilter,
} from '../common/Page/PageStates';
import type { UserSettings } from '../common/Page/types';
import { useFields } from '../common/Page/useFields';
import { DEFAULT_PER_PAGE, usePagination } from '../common/Page/usePagination';
import { DefaultHeader } from '../common/TableView/DefaultHeader';
import { DefaultRow } from '../common/TableView/DefaultRow';
import { TableView } from '../common/TableView/TableView';
import type { RowProps, TableViewHeaderProps } from '../common/TableView/types';
import { withTr } from '../common/TableView/withTr';
import type { GlobalActionToolbarProps, ResourceField } from '../common/utils/types';
import {
  TableSortContext,
  type TableSortContextProps,
  TableSortContextProvider,
  useTableSortContext,
} from '../TableSortContext';

import { reduceValueFilters } from './utils/reduceValueFilters';
import { ManageColumnsToolbar } from './ManageColumnsToolbar';

import './StandardPage.style.css';
import { INITIAL_PAGE } from './utils/constants';

export type StandardPageProps<T> = {
  dataSource: [T[], boolean, unknown];
  fieldsMetadata: ResourceField[];
  namespace: string;
  page: number;

  addButton?: JSX.Element;
  RowMapper?: FC<RowProps<T>>;
  CellMapper?: FC<RowProps<T>>;
  ExpandedComponent?: FC<RowProps<T>>;
  HeaderMapper?: FC<TableViewHeaderProps<T>>;
  extraSupportedFilters?: Record<string, FilterRenderer>;
  extraSupportedMatchers?: ValueMatcher[];
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
  pageRef?: React.MutableRefObject<number>;
  showManageColumns?: boolean;
  title?: string;
  noPadding?: boolean;
};

type StandardPageInnerProps<T> = Omit<StandardPageProps<T>, 'pageRef'> &
  TableSortContextProps &
  Required<Pick<StandardPageProps<T>, 'pageRef'>>;

const StandardPageInner = <T,>({
  activeSort,
  addButton,
  alerts,
  CellMapper,
  className,
  compareFn,
  customNoResultsFound,
  customNoResultsMatchFilter,
  dataSource: [flatData, loaded, error],
  expandedIds,
  extraSupportedFilters,
  extraSupportedMatchers,
  fieldsMetadata,
  GlobalActionToolbarItems = [],
  HeaderMapper = DefaultHeader<T>,
  namespace,
  noPadding,
  onSelect,
  page: initialPage,
  pageRef,
  pagination = DEFAULT_PER_PAGE,
  RowMapper = DefaultRow<T>,
  selectedIds,
  setActiveSort,
  showManageColumns = true,
  title,
  toId,
  userSettings,
}: StandardPageInnerProps<T>) => {
  const { t } = useForkliftTranslation();
  const [sortedData, setSortedData] = useState<T[]>([]);
  const [filteredData, setFilteredData] = useState<T[]>([]);
  const [page, setPage] = useState(initialPage);

  const onPageSet = useCallback(
    (newPage: number) => {
      pageRef.current = newPage;
      setPage(newPage);
    },
    [pageRef],
  );

  // Initialize page from ref on mount to handle cases where initialPage might change
  useEffect(() => {
    if (pageRef.current !== initialPage) {
      setPage(pageRef.current);
    }
  }, [initialPage, pageRef]);

  const [selectedFilters, setSelectedFilters] = useUrlFilters({
    fields: fieldsMetadata,
    userSettings,
  });

  const clearAllFilters = useCallback(() => {
    setSelectedFilters({});
  }, [setSelectedFilters]);

  const [fields, setFields] = useFields(namespace, fieldsMetadata, userSettings?.fields);

  const supportedMatchers = useMemo(
    () =>
      extraSupportedMatchers
        ? reduceValueFilters(extraSupportedMatchers, defaultValueMatchers)
        : defaultValueMatchers,
    [extraSupportedMatchers],
  );

  const supportedFilters = useMemo(
    () =>
      extraSupportedFilters
        ? { ...defaultSupportedFilters, ...extraSupportedFilters }
        : defaultSupportedFilters,
    [extraSupportedFilters],
  );

  useEffect(() => {
    if (flatData) {
      setSortedData([...flatData].sort(compareFn));
    }
  }, [flatData, compareFn, loaded]);

  const metaMatcher = useMemo(
    () => createMetaMatcher(selectedFilters, fields, supportedMatchers),
    [selectedFilters, fields, supportedMatchers],
  );

  useEffect(() => {
    if (sortedData) {
      setFilteredData(sortedData.filter(metaMatcher));
    }
  }, [sortedData, metaMatcher]);

  useEffect(() => {
    if (Object.values(selectedFilters).some((filter) => !isEmpty(filter))) {
      setPage(INITIAL_PAGE); // When filters are applied, reset to page 1 to show correct results
    }
  }, [selectedFilters]);

  const showPagination = useMemo(
    () => pagination === 'on' || (typeof pagination === 'number' && sortedData.length > pagination),
    [pagination, sortedData.length],
  );

  const { itemsPerPage, setPerPage } = usePagination({
    filteredDataLength: filteredData.length,
    userSettings: userSettings?.pagination,
  });

  const pageData = useMemo(
    () => filteredData.slice((page - 1) * itemsPerPage, page * itemsPerPage),
    [filteredData, page, itemsPerPage],
  );

  // Memoize error/loading states
  const errorFetchingData = useMemo(() => error, [error]);
  const noResults = useMemo(
    () => loaded && !error && sortedData.length === 0,
    [loaded, error, sortedData.length],
  );
  const noMatchingResults = useMemo(
    () => loaded && !error && filteredData.length === 0 && sortedData.length > 0,
    [loaded, error, filteredData.length, sortedData.length],
  );

  const primaryFilters = useMemo(
    () => fields.filter((field) => field.filter?.primary).map(toFieldFilter(sortedData)),
    [fields, sortedData],
  );

  const secondaryFilters = useMemo(
    () =>
      fields
        .filter(({ filter }) => filter && !filter.primary && !filter.standalone)
        .map(toFieldFilter(flatData)),
    [fields, flatData],
  );

  const standaloneFilters = useMemo(
    () => fields.filter((field) => field.filter?.standalone).map(toFieldFilter(flatData)),
    [fields, flatData],
  );

  const visibleColumns = useMemo(
    () => fields.filter(({ isHidden, isVisible }) => isVisible && !isHidden),
    [fields],
  );

  const onSetPage = useCallback<OnSetPage>(
    (_event, newPage) => {
      onPageSet(newPage);
    },
    [onPageSet],
  );

  const onPerPageSelect = useCallback<OnPerPageSelect>(
    (_event, perPage, newPage) => {
      setPerPage(perPage);
      onPageSet(newPage);
    },
    [setPerPage, onPageSet],
  );

  const RowComponent = useMemo(
    () => (CellMapper ? withTr(CellMapper) : RowMapper),
    [CellMapper, RowMapper],
  );

  const dataOnScreen = useMemo(
    () => (showPagination ? pageData : filteredData),
    [showPagination, pageData, filteredData],
  );

  const dataIds = useMemo(
    () => filteredData?.map((data) => toId?.(data) ?? ''),
    [filteredData, toId],
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
      <PageSection variant="light" padding={{ default: noPadding ? 'noPadding' : 'padding' }}>
        <Toolbar clearAllFilters={clearAllFilters} clearFiltersButtonText={t('Clear all filters')}>
          <ToolbarContent>
            <Split hasGutter>
              {selectedIds && onSelect && (
                <TableBulkSelect
                  selectedIds={selectedIds}
                  dataIds={dataIds}
                  pageDataIds={pageDataIds}
                  onSelect={onSelect}
                />
              )}

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
                  fieldFilters={secondaryFilters}
                  onFilterUpdate={setSelectedFilters}
                  selectedFilters={selectedFilters}
                  supportedFilterTypes={supportedFilters}
                />
                {Boolean(fields.find((field) => field.filter?.standalone)) && (
                  <FilterGroup
                    fieldFilters={standaloneFilters}
                    onFilterUpdate={setSelectedFilters}
                    selectedFilters={selectedFilters}
                    supportedFilterTypes={supportedFilters}
                  />
                )}
                {showManageColumns && (
                  <ManageColumnsToolbar
                    resourceFields={fields}
                    defaultColumns={fieldsMetadata}
                    setColumns={setFields}
                  />
                )}
                {!isEmpty(GlobalActionToolbarItems) && renderedGlobalActions}
              </ToolbarToggleGroup>
            </Split>

            {showPagination && (
              <ToolbarItem variant="pagination">
                <Pagination
                  variant="top"
                  perPage={itemsPerPage}
                  page={page}
                  itemCount={filteredData.length}
                  onSetPage={onSetPage}
                  onPerPageSelect={onPerPageSelect}
                />
              </ToolbarItem>
            )}
          </ToolbarContent>
        </Toolbar>
        <TableView<T>
          entities={dataOnScreen}
          visibleColumns={visibleColumns}
          aria-label={title ?? t('Page table')}
          Row={RowComponent}
          Header={HeaderMapper}
          activeSort={activeSort}
          setActiveSort={setActiveSort}
          currentNamespace={namespace}
          toId={toId}
          expandedIds={expandedIds}
        >
          {!loaded && !error && <Loading key="loading" title={t('Loading')} />}
          {Boolean(errorFetchingData) && (
            <ErrorState key="error" title={t('Unable to retrieve data')} />
          )}
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
            page={page}
            itemCount={filteredData.length}
            onSetPage={onSetPage}
            onPerPageSelect={onPerPageSelect}
          />
        )}
      </PageSection>
    </span>
  );
};

const StandardPage = <T,>(pageProps: StandardPageProps<T>) => {
  const { activeSort, compareFn, setActiveSort } = useTableSortContext();
  const internalPageRef = useRef(pageProps.page);
  const pageRef = pageProps.pageRef ?? internalPageRef;

  const defaultSort = useMemo(() => {
    const field = pageProps.fieldsMetadata.find((fld) => fld.defaultSortDirection);
    return field?.defaultSortDirection && field?.resourceFieldId
      ? { direction: field.defaultSortDirection, resourceFieldId: field.resourceFieldId }
      : undefined;
  }, [pageProps.fieldsMetadata]);

  if (activeSort.resourceFieldId) {
    return (
      <StandardPageInner
        {...pageProps}
        activeSort={activeSort}
        setActiveSort={setActiveSort}
        compareFn={compareFn}
        pageRef={pageRef}
      />
    );
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

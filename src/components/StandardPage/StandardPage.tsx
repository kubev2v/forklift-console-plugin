import React, { useMemo, useState } from 'react';
import {
  AttributeValueFilter,
  createMetaMatcher,
  EnumFilter,
  FreetextFilter,
  PrimaryFilters,
} from 'src/components/Filter';
import { FilterTypeProps } from 'src/components/Filter/types';
import { ManageColumnsToolbar, RowProps, TableView } from 'src/components/TableView';
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

import { toFieldFilter } from '../Filter/helpers';
import { useSort } from '../TableView/sort';

import { ErrorState, Loading, NoResultsFound, NoResultsMatchFilter } from './ResultStates';
import { useFields } from './useFields';

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
   * 'on' - always show pagination controls
   * 'off' - disable
   * 'auto' - display if unfiltered number of items is greater then current 'items per page' value
   */
  pagination?: 'auto' | 'on' | 'off';
}

// counting from one seems recommneded - zero breaks some cases
const DEFAULT_FIRST_PAGE = 1;
// first option in the default "per page" dropdown
const DEFAULT_PER_PAGE = 10;

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
  },
  customNoResultsFound,
  customNoResultsMatchFilter,
  pagination = 'auto',
}: StandardPageProps<T>) {
  const { t } = useTranslation();
  const [selectedFilters, setSelectedFilters] = useState({});
  const clearAllFilters = () => setSelectedFilters({});
  const [fields, setFields] = useFields(namespace, fieldsMetadata);
  const [perPage, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [page, setPage] = useState(DEFAULT_FIRST_PAGE);
  const [activeSort, setActiveSort, comparator] = useSort(fields);

  const filteredData = useMemo(
    () => flattenData.filter(createMetaMatcher(selectedFilters, fields)).sort(comparator),
    [flattenData, selectedFilters, fields, comparator],
  );

  const lastPage = Math.ceil(filteredData.length / perPage);
  const effectivePage = Math.min(page, lastPage);
  const showPagination =
    pagination === 'on' || (pagination === 'auto' && flattenData.length > perPage);

  const pageData = useMemo(
    () => filteredData.slice((effectivePage - 1) * perPage, effectivePage * perPage),
    [filteredData, effectivePage, perPage],
  );

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
                  perPage={perPage}
                  page={effectivePage}
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
            perPage={perPage}
            page={effectivePage}
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

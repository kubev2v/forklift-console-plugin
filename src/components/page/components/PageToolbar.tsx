import type { ReactNode } from 'react';
import { useMemo } from 'react';

import { AttributeValueFilter } from '@components/common/FilterGroup/AttributeValueFilter';
import { FilterGroup } from '@components/common/FilterGroup/FilterGroup';
import { toFieldFilter } from '@components/common/FilterGroup/helpers';
import type { FilterRenderer } from '@components/common/FilterGroup/types';
import type { ResourceField } from '@components/common/utils/types';
import TableBulkSelect from '@components/TableBulkSelect';
import type { OnPerPageSelect, OnSetPage } from '@patternfly/react-core';
import {
  Pagination,
  Split,
  Toolbar,
  ToolbarContent,
  ToolbarItem,
  ToolbarToggleGroup,
} from '@patternfly/react-core';
import { FilterIcon } from '@patternfly/react-icons';
import { isEmpty } from '@utils/helpers';
import { useForkliftTranslation } from '@utils/i18n';

import { ManageColumnsToolbar } from '../ManageColumnsToolbar';

type PageToolbarProps<T> = {
  fields: ResourceField[];
  flatData: T[];
  sortedData: T[];
  selectedFilters: Record<string, string[]>;
  setSelectedFilters: (filters: Record<string, string[]>) => void;
  supportedFilters: Record<string, FilterRenderer>;
  clearAllFilters: () => void;
  fieldsMetadata: ResourceField[];
  defaultFieldsWithoutFilters: ResourceField[];
  setFields: (fields: ResourceField[]) => void;
  showManageColumns?: boolean;
  showPagination: boolean;
  page: number;
  itemsPerPage: number;
  totalItems: number;
  onSetPage: OnSetPage;
  onPerPageSelect: OnPerPageSelect;
  selectedIds?: string[];
  dataIds?: string[];
  pageDataIds?: string[];
  onSelect?: (selectedIds: string[]) => void;
  renderedGlobalActions?: ReactNode[];
};

export const PageToolbar = <T,>({
  clearAllFilters,
  dataIds,
  defaultFieldsWithoutFilters,
  fields,
  fieldsMetadata,
  flatData,
  itemsPerPage,
  onPerPageSelect,
  onSelect,
  onSetPage,
  page,
  pageDataIds,
  renderedGlobalActions,
  selectedFilters,
  selectedIds,
  setFields,
  setSelectedFilters,
  showManageColumns = true,
  showPagination,
  sortedData,
  supportedFilters,
  totalItems,
}: PageToolbarProps<T>) => {
  const { t } = useForkliftTranslation();

  const primaryFilters = useMemo(
    () => fields.filter((field) => field.filter?.primary).map(toFieldFilter(sortedData)),
    [fields, sortedData],
  );

  const secondaryFilters = useMemo(
    () =>
      fieldsMetadata
        .filter(({ filter }) => filter && !filter.primary && !filter.standalone)
        .map(toFieldFilter(flatData)),
    [fieldsMetadata, flatData],
  );

  const standaloneFilters = useMemo(
    () => fields.filter((field) => field.filter?.standalone).map(toFieldFilter(flatData)),
    [fields, flatData],
  );

  return (
    <Toolbar clearAllFilters={clearAllFilters} clearFiltersButtonText={t('Clear all filters')}>
      <ToolbarContent>
        <Split hasGutter>
          {selectedIds && onSelect && dataIds && pageDataIds && (
            <TableBulkSelect
              selectedIds={selectedIds}
              dataIds={dataIds}
              pageDataIds={pageDataIds}
              onSelect={onSelect}
            />
          )}

          <ToolbarToggleGroup toggleIcon={<FilterIcon />} breakpoint="xl">
            {!isEmpty(primaryFilters) && (
              <FilterGroup
                fieldFilters={primaryFilters}
                onFilterUpdate={setSelectedFilters}
                selectedFilters={selectedFilters}
                supportedFilterTypes={supportedFilters}
              />
            )}
            {!isEmpty(secondaryFilters) && (
              <AttributeValueFilter
                fieldFilters={secondaryFilters}
                onFilterUpdate={setSelectedFilters}
                selectedFilters={selectedFilters}
                supportedFilterTypes={supportedFilters}
              />
            )}
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
                defaultColumns={defaultFieldsWithoutFilters}
                setColumns={setFields}
              />
            )}
            {!isEmpty(renderedGlobalActions) && renderedGlobalActions}
          </ToolbarToggleGroup>
        </Split>

        {showPagination && (
          <ToolbarItem variant="pagination">
            <Pagination
              variant="top"
              perPage={itemsPerPage}
              page={page}
              itemCount={totalItems}
              onSetPage={onSetPage}
              onPerPageSelect={onPerPageSelect}
            />
          </ToolbarItem>
        )}
      </ToolbarContent>
    </Toolbar>
  );
};

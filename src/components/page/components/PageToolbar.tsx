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
import { isSecondaryAttributeFilter } from '../utils/utils';

type PageToolbarProps<T> = {
  clearAllFilters: () => void;
  dataIds?: string[];
  defaultFieldsWithoutFilters: ResourceField[];
  fields: ResourceField[];
  fieldsMetadata: ResourceField[];
  flatData: T[];
  itemsPerPage: number;
  onPerPageSelect: OnPerPageSelect;
  onSelect?: (selectedIds: string[]) => void;
  onSetPage: OnSetPage;
  page: number;
  pageDataIds?: string[];
  renderedGlobalActions?: ReactNode[];
  selectedFilters: Record<string, string[]>;
  selectedIds?: string[];
  setFields: (fields: ResourceField[]) => void;
  setSelectedFilters: (filters: Record<string, string[]>) => void;
  showManageColumns?: boolean;
  showPagination: boolean;
  sortedData: T[];
  supportedFilters: Record<string, FilterRenderer>;
  totalItems: number;
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
    () => fieldsMetadata.filter(isSecondaryAttributeFilter).map(toFieldFilter(flatData)),
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
              dataIds={dataIds}
              onSelect={onSelect}
              pageDataIds={pageDataIds}
              selectedIds={selectedIds}
            />
          )}

          <ToolbarToggleGroup
            breakpoint="xl"
            className="forklift-page-toolbar__toggle-group"
            toggleIcon={<FilterIcon />}
          >
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
            {fields.some((field) => field.filter?.standalone) && (
              <FilterGroup
                fieldFilters={standaloneFilters}
                onFilterUpdate={setSelectedFilters}
                selectedFilters={selectedFilters}
                supportedFilterTypes={supportedFilters}
              />
            )}
            {showManageColumns && (
              <ManageColumnsToolbar
                defaultColumns={defaultFieldsWithoutFilters}
                resourceFields={fields}
                setColumns={setFields}
              />
            )}
            {!isEmpty(renderedGlobalActions) && renderedGlobalActions}
          </ToolbarToggleGroup>
        </Split>

        {showPagination && (
          <ToolbarItem variant="pagination">
            <Pagination
              itemCount={totalItems}
              onPerPageSelect={onPerPageSelect}
              onSetPage={onSetPage}
              page={page}
              perPage={itemsPerPage}
              variant="top"
            />
          </ToolbarItem>
        )}
      </ToolbarContent>
    </Toolbar>
  );
};

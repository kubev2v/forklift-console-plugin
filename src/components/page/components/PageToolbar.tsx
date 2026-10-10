import type { ReactElement, ReactNode } from 'react';

import { AttributeValueFilter } from '@components/common/FilterGroup/AttributeValueFilter';
import { FilterGroup } from '@components/common/FilterGroup/FilterGroup';
import type { FilterRenderer } from '@components/common/FilterGroup/types';
import ResetColumnWidthsToolbar from '@components/common/TableView/ResetColumnWidthsToolbar';
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

import { usePageToolbarFilterFields } from '../hooks/usePageToolbarFilterFields';
import { ManageColumnsToolbar } from '../ManageColumnsToolbar';

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
  resizableColumns?: boolean;
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
  resizableColumns = false,
  selectedFilters,
  selectedIds,
  setFields,
  setSelectedFilters,
  showManageColumns = true,
  showPagination,
  sortedData,
  supportedFilters,
  totalItems,
}: PageToolbarProps<T>): ReactElement => {
  const { t } = useForkliftTranslation();
  const { primaryFilters, secondaryFilters, standaloneFilters } = usePageToolbarFilterFields({
    fields,
    fieldsMetadata,
    flatData,
    sortedData,
  });

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
            {resizableColumns && <ResetColumnWidthsToolbar />}
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

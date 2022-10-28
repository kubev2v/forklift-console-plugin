import React from 'react';
import { useTranslation } from 'src/internal/i18n';

import { ToolbarGroup } from '@patternfly/react-core';

import { MetaFilterProps } from './types';

/**
 * Implementation of PatternFly 4 filter group pattern.
 * Extended to use any filter matching FilterTypeProps interface(not only enum based selection).
 *
 * @see FilterTypeProps
 */
export const PrimaryFilters = ({
  selectedFilters,
  onFilterUpdate,
  fieldFilters,
  supportedFilterTypes = {},
}: MetaFilterProps) => {
  const { t } = useTranslation();

  return (
    <ToolbarGroup variant="filter-group">
      {fieldFilters.map(({ fieldId: id, toFieldLabel, filterDef: filter }) => {
        const FilterType = supportedFilterTypes[filter.type];
        return (
          FilterType && (
            <FilterType
              key={id}
              filterId={id}
              onFilterUpdate={(values) =>
                onFilterUpdate({
                  ...selectedFilters,
                  [id]: values,
                })
              }
              placeholderLabel={filter.toPlaceholderLabel(t)}
              selectedFilters={selectedFilters[id] ?? []}
              title={filter?.toLabel?.(t) ?? toFieldLabel(t)}
              showFilter={true}
              supportedValues={filter.values}
            />
          )
        );
      })}
    </ToolbarGroup>
  );
};

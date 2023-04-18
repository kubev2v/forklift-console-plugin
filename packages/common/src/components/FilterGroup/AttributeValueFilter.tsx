import React, { useState } from 'react';

import {
  Select,
  SelectOption,
  SelectOptionObject,
  SelectVariant,
  ToolbarGroup,
  ToolbarItem,
} from '@patternfly/react-core';

import { FilterFromDef } from './FilterFromDef';
import { MetaFilterProps } from './types';

interface IdOption extends SelectOptionObject {
  id: string;
}

const toSelectOption = (id: string, label: string): IdOption => ({
  id,
  toString: () => label,
  compareTo: (other: IdOption): boolean => id === other?.id,
});

/**
 * Implementation of PatternFly 4 attribute-value filter pattern.
 * Accepts any filter matching FilterTypeProps interface.
 *
 * @see FilterTypeProps
 */
export const AttributeValueFilter = ({
  selectedFilters,
  onFilterUpdate,
  fieldFilters,
  supportedFilterTypes = {},
  resolvedLanguage,
}: MetaFilterProps) => {
  const [currentFilter, setCurrentFilter] = useState(fieldFilters?.[0]);
  const [expanded, setExpanded] = useState(false);

  const selectOptionToFilter = (selectedId) =>
    fieldFilters.find(({ resourceFieldId }) => resourceFieldId === selectedId) ?? currentFilter;

  const onFilterTypeSelect = (event, value, isPlaceholder) => {
    if (!isPlaceholder) {
      setCurrentFilter(selectOptionToFilter(value?.id));
      setExpanded(!expanded);
    }
  };

  return (
    <ToolbarGroup variant="filter-group">
      <ToolbarItem>
        <Select
          onSelect={onFilterTypeSelect}
          onToggle={setExpanded}
          isOpen={expanded}
          variant={SelectVariant.single}
          aria-label={'Select Filter'}
          selections={
            currentFilter && toSelectOption(currentFilter.resourceFieldId, currentFilter.label)
          }
        >
          {fieldFilters.map(({ resourceFieldId, label }) => (
            <SelectOption key={resourceFieldId} value={toSelectOption(resourceFieldId, label)} />
          ))}
        </Select>
      </ToolbarItem>

      {fieldFilters.map(({ resourceFieldId, label, filterDef }) => (
        <FilterFromDef
          key={resourceFieldId}
          {...{
            resourceFieldId,
            label,
            filterDef,
            onFilterUpdate,
            selectedFilters,
            FilterType: supportedFilterTypes[filterDef.type],
            showFilter: currentFilter?.resourceFieldId === resourceFieldId,
            resolvedLanguage,
          }}
        />
      ))}
    </ToolbarGroup>
  );
};

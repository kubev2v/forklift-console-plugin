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

const toSelectOption = (id: string, label: string): SelectOptionObject => ({
  toString: () => label,
  compareTo: (o) => o.id === id,
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
}: MetaFilterProps) => {
  const [currentFilter, setCurrentFilter] = useState(fieldFilters?.[0]);
  const [expanded, setExpanded] = useState(false);

  const selectOptionToFilter = (selectedId) =>
    fieldFilters.find(({ resourceFieldID }) => resourceFieldID === selectedId) ?? currentFilter;

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
            currentFilter && toSelectOption(currentFilter.resourceFieldID, currentFilter.label)
          }
        >
          {fieldFilters.map(({ resourceFieldID, label }) => (
            <SelectOption key={resourceFieldID} value={toSelectOption(resourceFieldID, label)} />
          ))}
        </Select>
      </ToolbarItem>

      {fieldFilters.map(({ resourceFieldID, label, filterDef }) => (
        <FilterFromDef
          key={resourceFieldID}
          {...{
            resourceFieldID,
            label,
            filterDef,
            onFilterUpdate,
            selectedFilters,
            FilterType: supportedFilterTypes[filterDef.type],
            showFilter: currentFilter?.resourceFieldID === resourceFieldID,
          }}
        />
      ))}
    </ToolbarGroup>
  );
};

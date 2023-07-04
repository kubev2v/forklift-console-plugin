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
 * This is an implementation of [<font>``PatternFly 4`` attribute-value filter</font>](https://www.patternfly.org/v4/demos/filters/design-guidelines/#attribute-value-filter) pattern,
 * extended to use any filter matching FilterTypeProps interface (not only enum based selection but also free text, boolean switch and grouped enum based).
 *
 * [<img src="static/media/src/components-stories/assets/github-logo.svg"><i class="fi fi-brands-github">
 * <font color="green">View component source on GitHub</font>](https://github.com/kubev2v/forklift-console-plugin/blob/main/packages/common/src/components/FilterGroup/AttributeValueFilter.tsx)
 *
 * @see FilterTypeProps
 */
export const AttributeValueFilter = ({
  selectedFilters = {},
  onFilterUpdate,
  fieldFilters,
  supportedFilterTypes,
  resolvedLanguage = 'en',
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

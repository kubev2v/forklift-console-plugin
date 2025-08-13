import { type Ref, useState } from 'react';

import {
  MenuToggle,
  type MenuToggleElement,
  Select,
  SelectList,
  SelectOption,
  ToolbarGroup,
  ToolbarItem,
} from '@patternfly/react-core';

import { FilterFromDef } from './FilterFromDef';
import type { MetaFilterProps } from './types';

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
  fieldFilters,
  onFilterUpdate,
  resolvedLanguage = 'en',
  selectedFilters = {},
  supportedFilterTypes,
}: MetaFilterProps) => {
  const [currentFilter, setCurrentFilter] = useState(fieldFilters?.[0]);
  const [isOpen, setIsOpen] = useState(false);

  const selectOptionToFilter = (selectedValue: string) =>
    fieldFilters.find(({ label }) => label === selectedValue) ?? currentFilter;

  const onToggleClick = () => {
    setIsOpen((prev) => !prev);
  };

  const toggle = (toggleRef: Ref<MenuToggleElement>) => (
    <MenuToggle ref={toggleRef} onClick={onToggleClick} isExpanded={isOpen} isFullWidth>
      {currentFilter.label}
    </MenuToggle>
  );

  const onSelect = (value?: string) => {
    if (value) {
      setCurrentFilter(selectOptionToFilter(value));
    }
    setIsOpen((prev) => !prev);
  };

  const renderOptions = () => {
    return fieldFilters.map(({ label, resourceFieldId }) => (
      <SelectOption key={resourceFieldId} value={label}>
        {label}
      </SelectOption>
    ));
  };

  return (
    <ToolbarGroup variant="filter-group">
      <ToolbarItem>
        {/* This select is different from most and cannot use the common Select */}
        {/* eslint-disable-next-line no-restricted-syntax */}
        <Select
          role="menu"
          aria-label={'Select Filter'}
          isOpen={isOpen}
          selected={currentFilter?.label}
          onSelect={(_ev, value) => {
            onSelect(String(value));
          }}
          onOpenChange={(nextOpen: boolean) => {
            setIsOpen(nextOpen);
          }}
          toggle={toggle}
          shouldFocusToggleOnSelect
          shouldFocusFirstItemOnOpen={false}
          isScrollable
          popperProps={{
            appendTo: document.body,
            direction: 'down',
            enableFlip: true,
          }}
        >
          <SelectList>{renderOptions()}</SelectList>
        </Select>
      </ToolbarItem>

      {fieldFilters.map(({ filterDef, label, resourceFieldId }) => (
        <FilterFromDef
          key={resourceFieldId}
          {...{
            filterDef,
            FilterType: supportedFilterTypes[filterDef.type],
            label,
            onFilterUpdate,
            resolvedLanguage,
            resourceFieldId,
            selectedFilters,
            showFilter: currentFilter?.resourceFieldId === resourceFieldId,
          }}
        />
      ))}
    </ToolbarGroup>
  );
};

import React, { type MouseEvent as ReactMouseEvent, type Ref, useState } from 'react';

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
    setIsOpen((isOpen) => !isOpen);
  };

  const toggle = (toggleRef: Ref<MenuToggleElement>) => (
    <MenuToggle ref={toggleRef} onClick={onToggleClick} isExpanded={isOpen} isFullWidth>
      {currentFilter.label}
    </MenuToggle>
  );

  const onSelect: (event?: ReactMouseEvent, value?: string | number) => void = (
    _event,
    value: string,
  ) => {
    setCurrentFilter(selectOptionToFilter(value));
    setIsOpen((isOpen) => !isOpen);
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
        <Select
          role="menu"
          aria-label={'Select Filter'}
          isOpen={isOpen}
          selected={currentFilter && currentFilter.label}
          onSelect={onSelect}
          onOpenChange={(nextOpen: boolean) => {
            setIsOpen(nextOpen);
          }}
          toggle={toggle}
          shouldFocusToggleOnSelect
          shouldFocusFirstItemOnOpen={false}
          isScrollable
          popperProps={{
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

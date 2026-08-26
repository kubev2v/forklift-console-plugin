import { type ReactElement, type Ref, useState } from 'react';

import {
  MenuToggle,
  type MenuToggleElement,
  Select as PatternFlySelect,
  SelectList,
  SelectOption,
  ToolbarGroup,
  ToolbarItem,
} from '@patternfly/react-core';

import { FilterFromDef } from './FilterFromDef';
import type { FieldFilter, MetaFilterProps } from './types';

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
  selectedFilters,
  supportedFilterTypes,
}: MetaFilterProps): ReactElement => {
  const [currentFilter, setCurrentFilter] = useState(fieldFilters?.[0]);
  const [isOpen, setIsOpen] = useState(false);

  const selectOptionToFilter = (selectedValue: string): FieldFilter =>
    fieldFilters.find(
      ({ filterDef, label }) => filterDef.fieldLabel === selectedValue || label === selectedValue,
    ) ?? currentFilter;

  const onToggleClick = (): void => {
    setIsOpen((prev) => !prev);
  };

  const toggle = (toggleRef: Ref<MenuToggleElement>): ReactElement => (
    <MenuToggle
      data-testid="attribute-filter-toggle"
      isExpanded={isOpen}
      isFullWidth
      onClick={onToggleClick}
      ref={toggleRef}
    >
      {currentFilter?.filterDef?.fieldLabel ?? currentFilter?.label}
    </MenuToggle>
  );

  const onSelect = (value?: string): void => {
    if (value) {
      setCurrentFilter(selectOptionToFilter(value));
    }
    setIsOpen((prev) => !prev);
  };

  const renderOptions = (): ReactElement[] => {
    return fieldFilters.map(({ filterDef, label, resourceFieldId }) => (
      <SelectOption
        data-testid={`filter-option-${resourceFieldId}`}
        key={resourceFieldId}
        value={filterDef?.fieldLabel ?? label}
      >
        {filterDef?.fieldLabel ?? label}
      </SelectOption>
    ));
  };

  return (
    <ToolbarGroup variant="filter-group">
      <ToolbarItem>
        {/* Cannot use @components/common/Select — attribute picker with custom toggle */}
        <PatternFlySelect
          aria-label={'Select Filter'}
          isOpen={isOpen}
          isScrollable
          onOpenChange={(nextOpen: boolean) => {
            setIsOpen(nextOpen);
          }}
          onSelect={(_ev, value) => {
            onSelect(String(value));
          }}
          popperProps={{
            appendTo: document.body,
            direction: 'down',
            enableFlip: true,
          }}
          role="menu"
          selected={currentFilter?.filterDef?.fieldLabel ?? currentFilter?.label}
          shouldFocusFirstItemOnOpen={false}
          shouldFocusToggleOnSelect
          toggle={toggle}
        >
          <SelectList>{renderOptions()}</SelectList>
        </PatternFlySelect>
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

import { type MouseEvent as ReactMouseEvent, type ReactElement, type Ref, useState } from 'react';

import { useUniqueEnums } from '@components/common/Filter/useUniqueEnums';
import {
  Badge,
  MenuToggle,
  type MenuToggleElement,
  Select as PatternFlySelect,
  SelectList,
  SelectOption,
  ToolbarFilter,
  type ToolbarLabel,
} from '@patternfly/react-core';
import { isEmpty } from '@utils/helpers';

import type { FilterTypeProps } from './types';

const EMPTY_ENUM_IDS: string[] = [];
const EMPTY_ENUM_VALUES: NonNullable<FilterTypeProps['supportedValues']> = [];

/**
 * This Filter type enables selecting one or many enum values from the list.
 *
 * **Enum contract**:<br>
 * 1) enum IDs (not translated identifiers) are required to be constant and unique within the enum.<br>
 * 2) the translated labels might be duplicated (one label may map to multiple enum IDs).
 * In such case enums with duplicated labels will be grouped as one option.
 * The common scenario are values not known at the compile time represented by one label i.e. 'Unknown'.
 *
 * **FilterTypeProps are interpreted as follows**:<br>
 * 1) selectedFilters - selected enum IDs.<br>
 * 2) onFilterUpdate - accepts the list of selected enum IDs.<br>
 * 3) supportedValues - supported enum values.
 *
 * [<img src="static/media/src/components-stories/assets/github-logo.svg"><i class="fi fi-brands-github">
 * <font color="green">View component source on GitHub</font>](https://github.com/kubev2v/forklift-console-plugin/blob/main/packages/common/src/components/Filter/EnumFilter.tsx)
 */
export const EnumFilter = ({
  filterId,
  onFilterUpdate: onSelectedEnumIdsChange,
  placeholderLabel,
  resolvedLanguage,
  selectedFilters: selectedEnumIds = EMPTY_ENUM_IDS,
  showFilter = true,
  supportedValues: supportedEnumValues = EMPTY_ENUM_VALUES,
  title = '',
}: FilterTypeProps): ReactElement => {
  const [isOpen, setIsOpen] = useState(false);
  const { onUniqueFilterUpdate, selectedUniqueEnumLabels } = useUniqueEnums({
    onSelectedEnumIdsChange,
    resolvedLanguage,
    selectedEnumIds,
    supportedEnumValues,
  });

  const deleteFilter = (label: string | ToolbarLabel): void => {
    onUniqueFilterUpdate(selectedUniqueEnumLabels.filter((filterLabel) => filterLabel !== label));
  };

  const hasFilter = (label: string): boolean => selectedUniqueEnumLabels.includes(label);

  const addFilter = (label: string): void => {
    if (typeof label === 'string') {
      onUniqueFilterUpdate([...selectedUniqueEnumLabels, label]);
    }
  };

  const onToggleClick = (): void => {
    setIsOpen((prev) => !prev);
  };

  const onSelect = (
    _event: ReactMouseEvent | undefined,
    value: string | number | undefined,
  ): void => {
    if (hasFilter(value as string)) {
      deleteFilter(value as string);
      return;
    }
    addFilter(value as string);
  };

  const toggle = (toggleRef: Ref<MenuToggleElement>): ReactElement => (
    <MenuToggle
      data-testid={`filter-toggle-${filterId}`}
      isExpanded={isOpen}
      isFullWidth
      onClick={onToggleClick}
      ref={toggleRef}
    >
      <>{placeholderLabel}</>
      {!isEmpty(selectedUniqueEnumLabels) && (
        <Badge className="pf-v6-u-ml-sm" isRead>
          {selectedUniqueEnumLabels.length}
        </Badge>
      )}
    </MenuToggle>
  );

  const renderOptions = (): ReactElement[] => {
    return supportedEnumValues.map((label) => (
      <SelectOption
        data-testid={`filter-value-${label.id}`}
        hasCheckbox
        isSelected={selectedUniqueEnumLabels.includes(label.label)}
        key={label.id}
        value={label.label}
      >
        {label?.icon} {label.label}
      </SelectOption>
    ));
  };

  return (
    <ToolbarFilter
      categoryName={title}
      deleteLabel={(category, option) => {
        deleteFilter(option);
      }}
      deleteLabelGroup={() => {
        onUniqueFilterUpdate([]);
      }}
      key={filterId}
      labels={selectedUniqueEnumLabels}
      showToolbarItem={showFilter}
    >
      {/* Cannot use @components/common/Select — needs custom toggle/checkbox multi-select */}
      <PatternFlySelect
        aria-label={placeholderLabel}
        isOpen={isOpen}
        isScrollable
        onOpenChange={(nextOpen: boolean) => {
          setIsOpen(nextOpen);
        }}
        onSelect={onSelect}
        popperProps={{
          appendTo: document.body,
          direction: 'down',
          enableFlip: true,
        }}
        role="menu"
        selected={selectedUniqueEnumLabels}
        shouldFocusFirstItemOnOpen={false}
        shouldFocusToggleOnSelect
        toggle={toggle}
      >
        <SelectList>{renderOptions()}</SelectList>
      </PatternFlySelect>
    </ToolbarFilter>
  );
};

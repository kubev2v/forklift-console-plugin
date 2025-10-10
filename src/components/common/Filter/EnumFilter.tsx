import { type MouseEvent as ReactMouseEvent, type Ref, useState } from 'react';

import { useUniqueEnums } from '@components/common/Filter/useUniqueEnums';
import {
  Badge,
  MenuToggle,
  type MenuToggleElement,
  Select,
  SelectList,
  SelectOption,
  ToolbarFilter,
  type ToolbarLabel,
} from '@patternfly/react-core';
import { isEmpty } from '@utils/helpers';

import type { FilterTypeProps } from './types';

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
  selectedFilters: selectedEnumIds = [],
  showFilter = true,
  supportedValues: supportedEnumValues = [],
  title = '',
}: FilterTypeProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { onUniqueFilterUpdate, selectedUniqueEnumLabels, uniqueEnumLabels } = useUniqueEnums({
    onSelectedEnumIdsChange,
    resolvedLanguage,
    selectedEnumIds,
    supportedEnumValues,
  });

  const deleteFilter = (label: string | ToolbarLabel): void => {
    onUniqueFilterUpdate(selectedUniqueEnumLabels.filter((filterLabel) => filterLabel !== label));
  };

  const hasFilter = (label: string): boolean =>
    Boolean(selectedUniqueEnumLabels.find((filterLabel) => filterLabel === label));

  const addFilter = (label: string): void => {
    if (typeof label === 'string') {
      onUniqueFilterUpdate([...selectedUniqueEnumLabels, label]);
    }
  };

  const onToggleClick = () => {
    setIsOpen((prev) => !prev);
  };

  const onSelect = (_event: ReactMouseEvent | undefined, value: string | number | undefined) => {
    if (hasFilter(value as string)) {
      deleteFilter(value as string);
      return;
    }
    addFilter(value as string);
  };

  const toggle = (toggleRef: Ref<MenuToggleElement>) => (
    <MenuToggle ref={toggleRef} onClick={onToggleClick} isExpanded={isOpen} isFullWidth>
      <>{placeholderLabel}</>
      {!isEmpty(selectedUniqueEnumLabels) && (
        <Badge isRead className="pf-v6-u-ml-sm">
          {selectedUniqueEnumLabels.length}
        </Badge>
      )}
    </MenuToggle>
  );

  const renderOptions = () => {
    return uniqueEnumLabels.map((label) => (
      <SelectOption
        hasCheckbox
        key={label}
        value={label}
        isSelected={selectedUniqueEnumLabels.includes(label)}
      >
        {label}
      </SelectOption>
    ));
  };

  return (
    <ToolbarFilter
      key={filterId}
      labels={selectedUniqueEnumLabels}
      deleteLabel={(category, option) => {
        deleteFilter(option);
      }}
      deleteLabelGroup={() => {
        onUniqueFilterUpdate([]);
      }}
      categoryName={title}
      showToolbarItem={showFilter}
    >
      {/* This select is different from most and cannot use the common Select */}
      {/* eslint-disable-next-line no-restricted-syntax */}
      <Select
        role="menu"
        aria-label={placeholderLabel}
        isOpen={isOpen}
        selected={selectedUniqueEnumLabels}
        onSelect={onSelect}
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
    </ToolbarFilter>
  );
};

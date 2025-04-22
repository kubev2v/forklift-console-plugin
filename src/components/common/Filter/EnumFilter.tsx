import { type MouseEvent as ReactMouseEvent, type Ref, useMemo, useState } from 'react';

import {
  Badge,
  MenuToggle,
  type MenuToggleElement,
  Select,
  SelectList,
  SelectOption,
  type ToolbarChip,
  ToolbarFilter,
} from '@patternfly/react-core';

import { localeCompare } from '../utils/localCompare';

import type { FilterTypeProps } from './types';

/**
 * One label may map to multiple enum ids due to translation or by design (i.e. "Unknown")
 * Aggregate enums with the same label and display them as a single option.
 *
 * @returns { uniqueEnumLabels, onUniqueFilterUpdate, selectedUniqueEnumLabels };
 */
export const useUnique = ({
  onSelectedEnumIdsChange,
  resolvedLanguage = 'en',
  selectedEnumIds,
  supportedEnumValues,
}: {
  supportedEnumValues: {
    id: string;
    label: string;
  }[];
  onSelectedEnumIdsChange: (values: string[]) => void;
  selectedEnumIds: string[];
  resolvedLanguage: string;
}): {
  uniqueEnumLabels: string[];
  onUniqueFilterUpdate: (selectedEnumLabels: string[]) => void;
  selectedUniqueEnumLabels: string[];
} => {
  const translatedEnums = useMemo(
    () =>
      supportedEnumValues.map((it) => ({
        id: it.id,
        // fallback to ID
        label: it.label ?? it.id,
      })),

    [supportedEnumValues],
  );

  // group filters with the same label
  const labelToIds = useMemo(
    () =>
      translatedEnums.reduce((acc, { id, label }) => {
        acc[label] = [...(acc?.[label] ?? []), id];
        return acc;
      }, {}),
    [translatedEnums],
  );

  // for easy reverse lookup
  const idToLabel = useMemo(
    () =>
      translatedEnums.reduce((acc, { id, label }) => {
        acc[id] = label;
        return acc;
      }, {}),
    [translatedEnums],
  );

  const uniqueEnumLabels = useMemo(
    () =>
      Object.entries(labelToIds)
        .map(([label]) => label)
        .sort((a, b) => localeCompare(a, b, resolvedLanguage)),
    [labelToIds],
  );

  const onUniqueFilterUpdate = useMemo(
    () =>
      (labels: string[]): void => {
        onSelectedEnumIdsChange(labels.flatMap((label) => labelToIds[label] ?? []));
      },
    [onSelectedEnumIdsChange, labelToIds],
  );

  const selectedUniqueEnumLabels = useMemo(
    () => [...new Set(selectedEnumIds.map((id) => idToLabel[id]).filter(Boolean))] as string[],
    [selectedEnumIds, idToLabel],
  );

  return { onUniqueFilterUpdate, selectedUniqueEnumLabels, uniqueEnumLabels };
};

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
  title,
}: FilterTypeProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { onUniqueFilterUpdate, selectedUniqueEnumLabels, uniqueEnumLabels } = useUnique({
    onSelectedEnumIdsChange,
    resolvedLanguage,
    selectedEnumIds,
    supportedEnumValues,
  });

  const deleteFilter = (label: string | ToolbarChip): void => {
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
    setIsOpen((isOpen) => !isOpen);
  };

  const onSelect = (_event: ReactMouseEvent | undefined, value: string | number | undefined) => {
    hasFilter(value as string) ? deleteFilter(value as string) : addFilter(value as string);
  };

  const toggle = (toggleRef: Ref<MenuToggleElement>) => (
    <MenuToggle ref={toggleRef} onClick={onToggleClick} isExpanded={isOpen} isFullWidth>
      <>{placeholderLabel}</>
      {selectedUniqueEnumLabels.length > 0 && (
        <Badge isRead>{selectedUniqueEnumLabels.length}</Badge>
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
      chips={selectedUniqueEnumLabels}
      deleteChip={(category, option) => {
        deleteFilter(option);
      }}
      deleteChipGroup={() => {
        onUniqueFilterUpdate([]);
      }}
      categoryName={title}
      showToolbarItem={showFilter}
    >
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
          direction: 'down',
          enableFlip: true,
        }}
      >
        <SelectList>{renderOptions()}</SelectList>
      </Select>
    </ToolbarFilter>
  );
};

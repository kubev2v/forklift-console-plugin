import React, { useMemo, useState } from 'react';
import { useTranslation } from 'src/internal/i18n';
import { localeCompare } from 'src/utils/helpers';

import {
  Select,
  SelectOption,
  SelectOptionObject,
  SelectVariant,
  ToolbarChip,
  ToolbarFilter,
} from '@patternfly/react-core';

import { FilterTypeProps } from './types';

/**
 * One label may map to multiple enum ids due to translation or by design (i.e. "Unknown")
 * Aggregate enums with the same label and display them as a single option.
 *
 * @returns { uniqueEnumLabels, onUniqueFilterUpdate, selectedUniqueEnumLabels };
 */
export const useUnique = ({
  supportedEnumValues,
  onSelectedEnumIdsChange,
  selectedEnumIds,
}: {
  supportedEnumValues: {
    id: string;
    toLabel(t: (key: string) => string): string;
  }[];
  onSelectedEnumIdsChange: (values: string[]) => void;
  selectedEnumIds: string[];
}): {
  uniqueEnumLabels: string[];
  onUniqueFilterUpdate: (selectedEnumLabels: string[]) => void;
  selectedUniqueEnumLabels: string[];
} => {
  const { t, i18n } = useTranslation();

  const translatedEnums = useMemo(
    () =>
      supportedEnumValues.map((it) => ({
        // fallback to ID
        label: it.toLabel?.(t) ?? it.id,
        id: it.id,
      })),

    [supportedEnumValues],
  );

  // group filters with the same label
  const labelToIds = useMemo(
    () =>
      translatedEnums.reduce((acc, { label, id }) => {
        acc[label] = [...(acc?.[label] ?? []), id];
        return acc;
      }, {}),
    [translatedEnums],
  );

  // for easy reverse lookup
  const idToLabel = useMemo(
    () =>
      translatedEnums.reduce((acc, { label, id }) => {
        acc[id] = label;
        return acc;
      }, {}),
    [translatedEnums],
  );

  const uniqueEnumLabels = useMemo(
    () =>
      Object.entries(labelToIds)
        .map(([label]) => label)
        .sort((a, b) => localeCompare(a, b, i18n.resolvedLanguage)),
    [labelToIds],
  );

  const onUniqueFilterUpdate = useMemo(
    () =>
      (labels: string[]): void =>
        onSelectedEnumIdsChange(labels.flatMap((label) => labelToIds[label] ?? [])),
    [onSelectedEnumIdsChange, labelToIds],
  );

  const selectedUniqueEnumLabels = useMemo(
    () => [...new Set(selectedEnumIds.map((id) => idToLabel[id]).filter(Boolean))] as string[],
    [selectedEnumIds, idToLabel],
  );

  return { uniqueEnumLabels, onUniqueFilterUpdate, selectedUniqueEnumLabels };
};

/**
 * Select one or many enum values from the list.
 * FilterTypeProps are interpeted as follows:
 * 1) selectedFilters - selected enum IDs (not translated constant identifiers)
 * 2) onFilterUpdate - accepts the list of selected enum IDs
 * 3) supportedValues - supported enum values
 */
export const EnumFilter = ({
  selectedFilters: selectedEnumIds = [],
  onFilterUpdate: onSelectedEnumIdsChange,
  supportedValues: supportedEnumValues = [],
  title,
  placeholderLabel,
  filterId,
  showFilter,
}: FilterTypeProps) => {
  const [isExpanded, setExpanded] = useState(false);
  const { uniqueEnumLabels, onUniqueFilterUpdate, selectedUniqueEnumLabels } = useUnique({
    supportedEnumValues,
    onSelectedEnumIdsChange,
    selectedEnumIds,
  });

  const deleteFilter = (label: string | ToolbarChip | SelectOptionObject): void =>
    onUniqueFilterUpdate(selectedUniqueEnumLabels.filter((filterLabel) => filterLabel !== label));

  const hasFilter = (label: string | SelectOptionObject): boolean =>
    !!selectedUniqueEnumLabels.find((filterLabel) => filterLabel === label);

  const addFilter = (label: string | SelectOptionObject): void => {
    if (typeof label === 'string') {
      onUniqueFilterUpdate([...selectedUniqueEnumLabels, label]);
    }
  };

  return (
    <ToolbarFilter
      key={filterId}
      chips={selectedUniqueEnumLabels}
      deleteChip={(category, option) => deleteFilter(option)}
      deleteChipGroup={() => onUniqueFilterUpdate([])}
      categoryName={title}
      showToolbarItem={showFilter}
    >
      <Select
        variant={SelectVariant.checkbox}
        aria-label={placeholderLabel}
        onSelect={(event, option, isPlaceholder) => {
          if (isPlaceholder) {
            return;
          }
          hasFilter(option) ? deleteFilter(option) : addFilter(option);
        }}
        selections={selectedUniqueEnumLabels}
        placeholderText={placeholderLabel}
        isOpen={isExpanded}
        onToggle={setExpanded}
      >
        {uniqueEnumLabels.map((label) => (
          <SelectOption key={label} value={label} />
        ))}
      </Select>
    </ToolbarFilter>
  );
};

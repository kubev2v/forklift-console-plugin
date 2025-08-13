import { useMemo } from 'react';

import { localeCompare } from '../utils/localCompare';

/**
 * One label may map to multiple enum ids due to translation or by design (i.e. "Unknown")
 * Aggregate enums with the same label and display them as a single option.
 *
 * @returns { uniqueEnumLabels, onUniqueFilterUpdate, selectedUniqueEnumLabels };
 */
export const useUniqueEnums = ({
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
      translatedEnums.reduce<Record<string, string[]>>((acc, { id, label }) => {
        acc[label] = [...(acc?.[label] ?? []), id];
        return acc;
      }, {}),
    [translatedEnums],
  );

  // for easy reverse lookup
  const idToLabel = useMemo(
    () =>
      translatedEnums.reduce<Record<string, string>>((acc, { id, label }) => {
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
    [labelToIds, resolvedLanguage],
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

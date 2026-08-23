import { type MouseEvent as ReactMouseEvent, useMemo, useState } from 'react';

import type { EnumValue } from '@components/common/utils/types';

import type { FilterTypeProps } from '../types';

type UseGroupedEnumFilterArgs = Pick<
  FilterTypeProps,
  'hasMultipleResources' | 'onFilterUpdate' | 'selectedFilters' | 'supportedValues'
>;

type UseGroupedEnumFilterReturn = {
  deleteFilter: (id: string) => void;
  deleteGroup: (groupId: string) => void;
  id2enum: Record<string, EnumValue>;
  isOpen: boolean;
  onSelect: (_event: ReactMouseEvent | undefined, value: string | number | undefined) => void;
  onToggleClick: () => void;
  selectedEnumIds: string[];
  setIsOpen: (open: boolean) => void;
};

export const useGroupedEnumFilter = ({
  hasMultipleResources,
  onFilterUpdate: onSelectedEnumIdsChange,
  selectedFilters: selectedEnumIds = [],
  supportedValues: supportedEnumValues = [],
}: UseGroupedEnumFilterArgs): UseGroupedEnumFilterReturn => {
  const [isOpen, setIsOpen] = useState(false);

  const id2enum = useMemo(
    () => Object.fromEntries(supportedEnumValues.map(({ id, ...rest }) => [id, { id, ...rest }])),
    [supportedEnumValues],
  );

  const label2enum = useMemo(
    () =>
      Object.fromEntries(
        supportedEnumValues.map(({ label, ...rest }) => [label, { label, ...rest }]),
      ),
    [supportedEnumValues],
  );

  const deleteGroup = (groupId: string): void => {
    if (hasMultipleResources) {
      onSelectedEnumIdsChange([], groupId);
      return;
    }

    onSelectedEnumIdsChange(
      selectedEnumIds.filter((id) => id2enum[id] && id2enum[id].groupId !== groupId),
    );
  };

  const deleteFilter = (id: string): void => {
    if (hasMultipleResources) {
      onSelectedEnumIdsChange(
        selectedEnumIds.filter(
          (selectedId) =>
            id2enum[selectedId]?.resourceFieldId === id2enum[id]?.resourceFieldId &&
            selectedId !== id,
        ),
        id2enum[id].resourceFieldId,
      );
    }

    onSelectedEnumIdsChange(
      selectedEnumIds.filter((enumId) => id2enum[enumId] && id !== enumId),
      id2enum[id].resourceFieldId,
    );
  };

  const hasFilter = (id: string): boolean => Boolean(id2enum[id]) && selectedEnumIds.includes(id);

  const addFilter = (id: string): void => {
    if (hasMultipleResources) {
      onSelectedEnumIdsChange(
        [
          ...selectedEnumIds.filter(
            (selectedId) => id2enum[selectedId]?.resourceFieldId === id2enum[id]?.resourceFieldId,
          ),
          id,
        ],
        id2enum[id].resourceFieldId,
      );
    }

    onSelectedEnumIdsChange(
      [...selectedEnumIds.filter((selectedId) => id2enum[selectedId]), id],
      id2enum[id].resourceFieldId,
    );
  };

  const onSelect = (
    _event: ReactMouseEvent | undefined,
    value: string | number | undefined,
  ): void => {
    const label = value?.toString();
    if (label) {
      const labelId = label2enum?.[label] ? label2enum[label]?.id : label;
      if (hasFilter(labelId)) {
        deleteFilter(labelId);
      } else {
        addFilter(labelId);
      }
    }
  };

  const onToggleClick = (): void => {
    setIsOpen((prev) => !prev);
  };

  return {
    deleteFilter,
    deleteGroup,
    id2enum,
    isOpen,
    onSelect,
    onToggleClick,
    selectedEnumIds,
    setIsOpen,
  };
};

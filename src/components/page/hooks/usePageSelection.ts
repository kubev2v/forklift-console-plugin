import { useCallback, useMemo, useState } from 'react';

type UsePageSelectionProps<T> = {
  expandedIds?: string[];
  onExpand?: (expandedIds: string[]) => void;
  onSelect?: (selectedIds: string[]) => void;
  selectedIds?: string[];
  toId?: (item: T) => string;
};

type UsePageSelectionResult<T> = {
  internalExpandedIds: string[] | undefined;
  internalSelectedIds: string[] | undefined;
  isExpanded: ((item: T) => boolean) | undefined;
  onSelectCallback: (ids: string[]) => void;
  toggleExpandFor: (items: T[]) => void;
  toggleSelectFor: (items: T[]) => void;
};

/** Manages selection/expansion state with toggle functions and callback handling. */
export const usePageSelection = <T>({
  expandedIds,
  onExpand,
  onSelect,
  selectedIds,
  toId,
}: UsePageSelectionProps<T>): UsePageSelectionResult<T> => {
  const [internalSelectedIds, setInternalSelectedIds] = useState(selectedIds);
  const [internalExpandedIds, setInternalExpandedIds] = useState(expandedIds);
  const [prevSelectedIds, setPrevSelectedIds] = useState(selectedIds);
  const [prevExpandedIds, setPrevExpandedIds] = useState(expandedIds);

  if (selectedIds !== prevSelectedIds) {
    setPrevSelectedIds(selectedIds);
    setInternalSelectedIds(selectedIds);
  }

  if (expandedIds !== prevExpandedIds) {
    setPrevExpandedIds(expandedIds);
    setInternalExpandedIds(expandedIds);
  }

  const itemToId = useCallback((item: T) => (toId ? toId(item) : ''), [toId]);

  const isExpanded = useMemo(
    () =>
      onExpand || internalExpandedIds
        ? (item: T): boolean => internalExpandedIds?.includes(itemToId(item)) ?? false
        : undefined,
    [onExpand, internalExpandedIds, itemToId],
  );

  const toggleSelectFor = useCallback(
    (items: T[]) => {
      const ids = items.map((item) => itemToId(item));
      const allSelected = ids.every((id) => internalSelectedIds?.includes(id));
      const newSelectedIds = [
        ...(internalSelectedIds ?? []).filter((it) => !ids.includes(it)),
        ...(allSelected ? [] : ids),
      ];

      setInternalSelectedIds(newSelectedIds);

      if (onSelect) {
        onSelect(newSelectedIds);
      }
    },
    [itemToId, internalSelectedIds, onSelect],
  );

  const toggleExpandFor = useCallback(
    (items: T[]) => {
      const ids = items.map((item) => itemToId(item));
      const allExpanded = ids.every((id) => internalExpandedIds?.includes(id));
      const newExpandedIds = [
        ...(internalExpandedIds ?? []).filter((it) => !ids.includes(it)),
        ...(allExpanded ? [] : ids),
      ];

      setInternalExpandedIds(newExpandedIds);
      if (onExpand) {
        onExpand(newExpandedIds);
      }
    },
    [itemToId, internalExpandedIds, onExpand],
  );

  const onSelectCallback = useCallback(
    (ids: string[]) => {
      setInternalSelectedIds(ids);
      onSelect?.(ids);
    },
    [onSelect],
  );

  return {
    internalExpandedIds,
    internalSelectedIds,
    isExpanded,
    onSelectCallback,
    toggleExpandFor,
    toggleSelectFor,
  };
};

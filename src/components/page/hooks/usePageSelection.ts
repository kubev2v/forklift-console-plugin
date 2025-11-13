import { useCallback, useEffect, useMemo, useState } from 'react';

type UsePageSelectionProps<T> = {
  toId?: (item: T) => string;
  onSelect?: (selectedIds: string[]) => void;
  selectedIds?: string[];
  onExpand?: (expandedIds: string[]) => void;
  expandedIds?: string[];
};

type UsePageSelectionResult<T> = {
  internalSelectedIds: string[] | undefined;
  internalExpandedIds: string[] | undefined;
  isExpanded: ((item: T) => boolean) | undefined;
  toggleSelectFor: (items: T[]) => void;
  toggleExpandFor: (items: T[]) => void;
  onSelectCallback: (ids: string[]) => void;
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

  const itemToId = useCallback((item: T) => (toId ? toId(item) : ''), [toId]);

  useEffect(() => {
    setInternalSelectedIds(selectedIds);
  }, [selectedIds]);

  useEffect(() => {
    setInternalExpandedIds(expandedIds);
  }, [expandedIds]);

  const isExpanded = useMemo(
    () =>
      onExpand || internalExpandedIds
        ? (item: T) => internalExpandedIds?.includes(itemToId(item)) ?? false
        : undefined,
    [onExpand, internalExpandedIds, itemToId],
  );

  const toggleSelectFor = useCallback(
    (items: T[]) => {
      const ids = items.map(itemToId);
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
      const ids = items.map(itemToId);
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

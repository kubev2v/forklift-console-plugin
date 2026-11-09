import type { ResourceField } from '@components/common/utils/types';

export const getVisibleColumns = (fields: ResourceField[]): ResourceField[] =>
  fields.filter(({ isHidden, isVisible }) => isVisible && !isHidden);

export const isSecondaryAttributeFilter = (field: ResourceField): boolean =>
  Boolean(
    field.filter && !field.filter.primary && !field.filter.standalone && !field.filter.isHidden,
  );

/** Keeps only ids present in `visibleIds`; returns the same reference when nothing is pruned. */
export const pruneSelectedIds = (selectedIds: string[], visibleIds: string[]): string[] => {
  const visible = new Set(visibleIds);
  const pruned = selectedIds.filter((id) => visible.has(id));

  return pruned.length === selectedIds.length ? selectedIds : pruned;
};
